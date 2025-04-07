const AppError = require('../utils/appError');
const sanitize = require('../utils/sanitize');
const AwarenessTeam = require('../models/AwarenessTeam');
const { Emergency, POI, UserLocation } = require('../models/map');
const User = require('../models/User');

/**
 * Safe Zones und Awareness-Teams für ein Event abrufen
 */
exports.getSafeZones = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    // Alle SafeZone POIs finden
    const safeZones = await POI.find({
      eventId,
      type: 'safezone'
    });
    
    // Zugehörige Awareness-Teams finden
    const safeZoneIds = safeZones.map(zone => zone._id);
    const awarenessTeams = await AwarenessTeam.find({
      safeZoneId: { $in: safeZoneIds }
    });
    
    // Awareness-Teams mit SafeZones verknüpfen
    const enrichedSafeZones = safeZones.map(zone => {
      const team = awarenessTeams.find(team => 
        team.safeZoneId.toString() === zone._id.toString()
      );
      
      return {
        id: zone._id,
        name: zone.name,
        type: zone.type,
        safeType: zone.safeType,
        coordinates: zone.coordinates,
        features: zone.features,
        description: zone.description,
        team: team ? {
          id: team._id,
          status: team.status,
          capacity: team.capacity,
          services: team.services,
          memberCount: team.members.length,
          availableMembers: team.members.filter(m => m.status === 'available').length,
          openingHours: team.openingHours
        } : null
      };
    });
    
    res.status(200).json({
      status: 'success',
      data: enrichedSafeZones
    });
  } catch (err) {
    next(new AppError(`Fehler beim Laden der Safe Zones: ${err.message}`, 500));
  }
};

/**
 * SOS-Hilferuf senden
 */
exports.sendSOS = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { eventId, message, latitude, longitude, emergencyType, requestedService } = sanitize.requestBody(req.body);
    
    if (!eventId || !latitude || !longitude) {
      return next(new AppError('Unvollständige SOS-Daten', 400));
    }
    
    // Nächste SafeZone finden
    const nearestSafeZone = await findNearestSafeZone(eventId, latitude, longitude);
    
    if (!nearestSafeZone) {
      return next(new AppError('Keine Safe Zone in der Nähe gefunden', 404));
    }
    
    // Zugehöriges Awareness-Team finden
    const awarenessTeam = await AwarenessTeam.findOne({
      safeZoneId: nearestSafeZone._id
    });
    
    if (!awarenessTeam || awarenessTeam.status === 'closed') {
      return next(new AppError('Kein aktives Awareness-Team verfügbar', 400));
    }
    
    // Notfall erstellen
    const emergency = await Emergency.create({
      userId,
      eventId,
      type: emergencyType || 'security',
      message: message || 'SOS-Hilferuf',
      location: {
        latitude,
        longitude
      },
      status: 'pending',
      severity: determineSeverity(emergencyType || 'security'),
      createdAt: new Date()
    });
    
    // Verfügbaren Mitarbeiter im Team finden
    const preferredRole = emergencyType === 'medical' ? 'medical' : 'security';
    const responder = awarenessTeam.findAvailableMember(preferredRole);
    
    if (responder) {
      // Notfall einem Team-Mitglied zuweisen
      emergency.responderId = responder.userId;
      emergency.responderType = 'awareness';
      emergency.status = 'accepted';
      emergency.estimatedResponseTime = '5 Minuten';
      
      await emergency.save();
      
      // Aktive Antwort zum Team hinzufügen
      awarenessTeam.activeResponses.push({
        emergencyId: emergency._id,
        responderId: responder.userId,
        status: 'en-route',
        startedAt: new Date()
      });
      
      // Status des Mitarbeiters aktualisieren
      const memberIndex = awarenessTeam.members.findIndex(m => 
        m.userId.toString() === responder.userId.toString()
      );
      
      if (memberIndex !== -1) {
        awarenessTeam.members[memberIndex].status = 'responding';
      }
      
      await awarenessTeam.save();
      
      // Team-Kapazität aktualisieren
      await awarenessTeam.updateCapacity();
    }
    
    res.status(201).json({
      status: 'success',
      data: {
        id: emergency._id,
        type: emergency.type,
        status: emergency.status,
        safeZone: {
          id: nearestSafeZone._id,
          name: nearestSafeZone.name,
          coordinates: nearestSafeZone.coordinates
        },
        responder: responder ? {
          id: responder.userId,
          name: responder.name,
          role: responder.role,
          estimatedTime: emergency.estimatedResponseTime
        } : null,
        message: responder 
          ? 'Ein Awareness-Team-Mitglied ist auf dem Weg zu dir' 
          : 'Dein SOS wurde registriert. Bitte begib dich zur nächsten Safe Zone'
      }
    });
  } catch (err) {
    next(new AppError(`Fehler beim Senden des SOS: ${err.message}`, 500));
  }
};

/**
 * Status einer SOS-Anfrage aktualisieren (für Team-Mitglieder)
 */
exports.updateSOSResponse = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { emergencyId } = req.params;
    const { status, notes } = sanitize.requestBody(req.body);
    
    if (!status) {
      return next(new AppError('Status ist erforderlich', 400));
    }
    
    // Prüfen, ob der Benutzer ein Team-Mitglied ist
    const awarenessTeam = await AwarenessTeam.findOne({
      'members.userId': userId
    });
    
    if (!awarenessTeam) {
      return next(new AppError('Nicht autorisiert - Awareness-Team-Mitgliedschaft erforderlich', 403));
    }
    
    // Aktive Antwort finden
    const responseIndex = awarenessTeam.activeResponses.findIndex(
      response => response.emergencyId.toString() === emergencyId
    );
    
    if (responseIndex === -1) {
      return next(new AppError('SOS-Antwort nicht gefunden', 404));
    }
    
    // Notfall finden
    const emergency = await Emergency.findById(emergencyId);
    
    if (!emergency) {
      return next(new AppError('Notfall nicht gefunden', 404));
    }
    
    // Status aktualisieren
    awarenessTeam.activeResponses[responseIndex].status = status;
    
    // Notfall-Status aktualisieren
    if (status === 'on-scene') {
      emergency.status = 'accepted';
    } else if (status === 'returning') {
      emergency.status = 'resolved';
      emergency.resolvedAt = new Date();
      
      // Teammitglied wieder verfügbar machen
      const memberIndex = awarenessTeam.members.findIndex(m => 
        m.userId.toString() === userId.toString()
      );
      
      if (memberIndex !== -1) {
        awarenessTeam.members[memberIndex].status = 'available';
      }
      
      // Aktive Antwort entfernen
      awarenessTeam.activeResponses.splice(responseIndex, 1);
    }
    
    if (notes) {
      emergency.notes = (emergency.notes || '') + `\n[${new Date().toISOString()}] ${notes}`;
    }
    
    await Promise.all([
      awarenessTeam.save(),
      emergency.save()
    ]);
    
    // Team-Kapazität aktualisieren
    await awarenessTeam.updateCapacity();
    
    res.status(200).json({
      status: 'success',
      data: {
        responseStatus: status,
        emergencyStatus: emergency.status
      }
    });
  } catch (err) {
    next(new AppError(`Fehler beim Aktualisieren des SOS-Status: ${err.message}`, 500));
  }
};

/**
 * Team-Mitgliederstatus aktualisieren
 */
exports.updateTeamMemberStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status, latitude, longitude } = sanitize.requestBody(req.body);
    
    if (!status) {
      return next(new AppError('Status ist erforderlich', 400));
    }
    
    // Team finden, in dem der Benutzer Mitglied ist
    const awarenessTeam = await AwarenessTeam.findOne({
      'members.userId': userId
    });
    
    if (!awarenessTeam) {
      return next(new AppError('Du bist kein Mitglied eines Awareness-Teams', 404));
    }
    
    // Mitglied finden und aktualisieren
    const memberIndex = awarenessTeam.members.findIndex(m => 
      m.userId.toString() === userId.toString()
    );
    
    if (memberIndex === -1) {
      return next(new AppError('Teammitglied nicht gefunden', 404));
    }
    
    // Status und ggf. Standort aktualisieren
    awarenessTeam.members[memberIndex].status = status;
    
    if (latitude && longitude) {
      awarenessTeam.members[memberIndex].location = {
        latitude,
        longitude,
        updatedAt: new Date()
      };
    }
    
    await awarenessTeam.save();
    
    // Team-Kapazität aktualisieren
    await awarenessTeam.updateCapacity();
    
    res.status(200).json({
      status: 'success',
      data: {
        teamId: awarenessTeam._id,
        memberId: awarenessTeam.members[memberIndex].userId,
        status: awarenessTeam.members[memberIndex].status,
        teamStatus: awarenessTeam.status
      }
    });
  } catch (err) {
    next(new AppError(`Fehler beim Aktualisieren des Mitgliederstatus: ${err.message}`, 500));
  }
};

/**
 * Awareness-Team auf der Karte anzeigen
 */
exports.getTeamLocations = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    // Alle SafeZones für das Event finden
    const safeZones = await POI.find({
      eventId,
      type: 'safezone'
    });
    
    const safeZoneIds = safeZones.map(zone => zone._id);
    
    // Alle Awareness-Teams für diese SafeZones finden
    const awarenessTeams = await AwarenessTeam.find({
      safeZoneId: { $in: safeZoneIds }
    });
    
    // Teammitglieder mit Standortdaten sammeln
    const teamMembers = [];
    
    awarenessTeams.forEach(team => {
      const safeZone = safeZones.find(zone => 
        zone._id.toString() === team.safeZoneId.toString()
      );
      
      team.members.forEach(member => {
        if (member.location && member.location.latitude) {
          teamMembers.push({
            id: member.userId,
            name: member.name,
            role: member.role,
            status: member.status,
            coordinates: [member.location.latitude, member.location.longitude],
            lastUpdate: member.location.updatedAt,
            safeZone: safeZone ? {
              id: safeZone._id,
              name: safeZone.name
            } : null
          });
        }
      });
    });
    
    res.status(200).json({
      status: 'success',
      data: teamMembers
    });
  } catch (err) {
    next(new AppError(`Fehler beim Laden der Team-Standorte: ${err.message}`, 500));
  }
};

// ========= Hilfsfunktionen ==========

/**
 * Findet die nächste SafeZone basierend auf Koordinaten
 */
async function findNearestSafeZone(eventId, latitude, longitude) {
  // Alle SafeZones für das Event finden
  const safeZones = await POI.find({
    eventId,
    type: 'safezone'
  });
  
  if (safeZones.length === 0) {
    return null;
  }
  
  // Distanz zu jeder SafeZone berechnen
  const zonesWithDistance = safeZones.map(zone => {
    const distance = calculateDistance(
      latitude, longitude,
      zone.coordinates[0], zone.coordinates[1]
    );
    
    return {
      zone,
      distance
    };
  });
  
  // Nach Distanz sortieren und die nächste zurückgeben
  zonesWithDistance.sort((a, b) => a.distance - b.distance);
  
  return zonesWithDistance[0].zone;
}

/**
 * Berechnet die Entfernung zwischen zwei Koordinaten (Haversine-Formel)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Erdradius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Konvertiert Grad in Radian
 */
function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Bestimmt den Schweregrad eines Notfalls basierend auf dem Typ
 */
function determineSeverity(type) {
  switch (type) {
    case 'medical':
      return 'high';
    case 'security':
      return 'high';
    case 'friend':
      return 'medium';
    case 'exit':
      return 'medium';
    default:
      return 'low';
  }
}