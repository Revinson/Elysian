const User = require('../models/User');
const AppError = require('../utils/appError');
const sanitize = require('../utils/sanitize');

// Importiere die Modelle aus der gemeinsamen map.js Datei
const {
  District,
  CulturalEvent,
  UserLocation,
  EventArea,
  POI,
  Voting,
  Emergency
} = require('../models/map');

/**
 * Eventdaten für die Karte holen
 */
exports.getEventData = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    // Event-Daten aus Datenbank holen
    const Event = require('../models/Event'); // Event-Modell separat importieren
    const event = await Event.findById(eventId);
    
    if (!event) {
      return next(new AppError('Event nicht gefunden', 404));
    }
    
    // Zugehörige Daten laden
    const areas = await EventArea.find({ eventId });
    const pois = await POI.find({ eventId });
    
    // Sammle und strukturiere die Daten für die Antwort
    const eventData = {
      id: event._id,
      name: event.name,
      areas: areas.map(area => ({
        id: area._id,
        name: area.name,
        type: area.type,
        coordinates: area.coordinates,
        color: area.color,
        fillColor: area.fillColor,
        capacity: area.capacity,
        currentVisitors: area.currentVisitors,
        description: area.description
      })),
      pois: pois.map(poi => ({
        id: poi._id,
        name: poi.name,
        type: poi.type,
        coordinates: poi.coordinates,
        // Spezifische Felder je nach POI-Typ
        ...(poi.type === 'dancefloor' && {
          currentDJ: poi.currentDJ,
          genre: poi.genre,
          capacity: poi.capacity,
          currentLoad: poi.currentLoad,
          voteActive: poi.voteActive
        }),
        ...(poi.type === 'bar' && {
          drinks: poi.drinks,
          waitTime: poi.waitTime,
          special: poi.special
        }),
        ...(poi.type === 'safezone' && {
          safeType: poi.safeType,
          features: poi.features,
          occupied: poi.occupied
        }),
        ...(poi.type === 'cultural' && {
          eventType: poi.eventType,
          description: poi.description,
          fee: poi.fee,
          time: poi.time
        })
      }))
    };
    
    res.status(200).json({
      status: 'success',
      data: eventData
    });
  } catch (err) {
    next(new AppError(`Fehler beim Laden der Event-Daten: ${err.message}`, 500));
  }
};

/**
 * Stadtbezirke holen
 */
exports.getDistricts = async (req, res, next) => {
  try {
    const districts = await District.find();
    
    res.status(200).json({
      status: 'success',
      data: districts.map(district => ({
        id: district._id,
        name: district.name,
        coordinates: district.coordinates,
        color: district.color,
        fillColor: district.fillColor,
        info: district.info
      }))
    });
  } catch (err) {
    next(new AppError(`Fehler beim Laden der Stadtbezirke: ${err.message}`, 500));
  }
};

/**
 * Kulturelle Events für einen bestimmten Bezirk holen
 */
exports.getCulturalEvents = async (req, res, next) => {
  try {
    const { districtId } = req.params;
    
    const culturalEvents = await CulturalEvent.find({ districtId });
    
    res.status(200).json({
      status: 'success',
      data: culturalEvents.map(event => ({
        id: event._id,
        name: event.name,
        date: event.date,
        type: event.type,
        description: event.description,
        location: event.location,
        coordinates: event.coordinates
      }))
    });
  } catch (err) {
    next(new AppError(`Fehler beim Laden der kulturellen Events: ${err.message}`, 500));
  }
};

/**
 * Positionen der Freunde auf dem Event holen
 */
exports.getFriendsPositions = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    
    // Freunde des Benutzers holen
    // Diese Abfrage hängt von deinem Freundschaftsmodell ab
    const user = await User.findById(userId).populate('friends');
    
    if (!user) {
      return next(new AppError('Benutzer nicht gefunden', 404));
    }
    
    // Freunde-IDs extrahieren
    const friendIds = user.friends.map(friend => friend._id);
    
    // Standorte der Freunde auf diesem Event holen
    const friendLocations = await UserLocation.find({
      userId: { $in: friendIds },
      eventId: eventId,
      updatedAt: { $gte: new Date(Date.now() - 300000) } // Letzte 5 Minuten
    }).populate('userId', 'username');
    
    // Daten für die Antwort formatieren
    const friends = friendLocations.map(loc => ({
      id: loc.userId._id,
      name: loc.userId.username,
      online: true, // Wenn Standort verfügbar ist, ist Benutzer online
      coordinates: [loc.latitude, loc.longitude]
    }));
    
    // Zusätzlich, Freunde hinzufügen, die offline sind (kein kürzlich aktualisierter Standort)
    const offlineFriends = user.friends
      .filter(friend => !friendLocations.some(loc => loc.userId._id.equals(friend._id)))
      .map(friend => ({
        id: friend._id,
        name: friend.username,
        online: false,
        coordinates: null
      }));
    
    res.status(200).json({
      status: 'success',
      data: [...friends, ...offlineFriends]
    });
  } catch (err) {
    next(new AppError(`Fehler beim Laden der Freundespositionen: ${err.message}`, 500));
  }
};

/**
 * Benutzerposition aktualisieren
 */
exports.updateUserLocation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { eventId, latitude, longitude } = sanitize.requestBody(req.body);
    
    if (!eventId || !latitude || !longitude) {
      return next(new AppError('EventId, latitude und longitude sind erforderlich', 400));
    }
    
    // Standort aktualisieren oder erstellen
    const location = await UserLocation.findOneAndUpdate(
      { userId, eventId },
      { 
        latitude, 
        longitude,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        id: location._id,
        eventId: location.eventId,
        coordinates: [location.latitude, location.longitude],
        updatedAt: location.updatedAt
      }
    });
  } catch (err) {
    next(new AppError(`Fehler beim Aktualisieren des Standorts: ${err.message}`, 500));
  }
};

/**
 * Heatmap-Daten für ein Event holen
 */
exports.getHeatmapData = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    // Standorte aller Benutzer auf diesem Event holen
    const userLocations = await UserLocation.find({
      eventId,
      updatedAt: { $gte: new Date(Date.now() - 300000) } // Letzte 5 Minuten
    });
    
    // Daten für die Heatmap formatieren
    const heatmapData = userLocations.map(loc => ({
      lat: loc.latitude,
      lng: loc.longitude,
      count: 1 // Jeder Benutzer zählt als 1 Punkt in der Heatmap
    }));
    
    // Wichtige Bereiche mit höherer Gewichtung hinzufügen
    const hotspots = await POI.find({
      eventId,
      type: { $in: ['dancefloor', 'bar'] }
    });
    
    hotspots.forEach(hotspot => {
      // Füge mehrere Datenpunkte für Hotspots hinzu
      const baseCount = hotspot.type === 'dancefloor' ? 5 : 3;
      
      // Zufällige Verteilung um den Hotspot herum
      for (let i = 0; i < 10; i++) {
        const lat = hotspot.coordinates[0] + (Math.random() - 0.5) * 0.0005;
        const lng = hotspot.coordinates[1] + (Math.random() - 0.5) * 0.0005;
        
        heatmapData.push({
          lat,
          lng,
          count: baseCount * (Math.random() * 0.5 + 0.75) // 75%-125% von baseCount
        });
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: heatmapData
    });
  } catch (err) {
    next(new AppError(`Fehler beim Laden der Heatmap-Daten: ${err.message}`, 500));
  }
};

/**
 * Aktive Votings auf dem Event holen
 */
exports.getActiveVotings = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    const votings = await Voting.find({
      eventId,
      active: true,
      endTime: { $gt: new Date() }
    });
    
    res.status(200).json({
      status: 'success',
      data: votings.map(voting => ({
        id: voting._id,
        name: voting.name,
        coordinates: voting.coordinates,
        timeLeft: getTimeLeftString(voting.endTime),
        options: voting.options.map(option => ({
          id: option._id,
          name: option.name,
          percentage: calculateVotePercentage(option.votes, voting.options)
        }))
      }))
    });
  } catch (err) {
    next(new AppError(`Fehler beim Laden der Votings: ${err.message}`, 500));
  }
};

/**
 * Stimme bei einem Voting abgeben
 */
exports.submitVote = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { votingId, optionId } = sanitize.requestBody(req.body);
    
    if (!votingId || !optionId) {
      return next(new AppError('VotingId und optionId sind erforderlich', 400));
    }
    
    // Aktives Voting finden
    const voting = await Voting.findOne({
      _id: votingId,
      active: true,
      endTime: { $gt: new Date() }
    });
    
    if (!voting) {
      return next(new AppError('Voting nicht gefunden oder bereits beendet', 404));
    }
    
    // Prüfen, ob Benutzer bereits abgestimmt hat
    const hasVoted = voting.voters.includes(userId);
    
    if (hasVoted) {
      return next(new AppError('Du hast bereits bei diesem Voting abgestimmt', 400));
    }
    
    // Option finden und Stimme hinzufügen
    const optionIndex = voting.options.findIndex(opt => opt._id.toString() === optionId);
    
    if (optionIndex === -1) {
      return next(new AppError('Option nicht gefunden', 404));
    }
    
    // Stimme hinzufügen
    voting.options[optionIndex].votes += 1;
    
    // Benutzer zu Wählern hinzufügen
    voting.voters.push(userId);
    
    // Speichern
    await voting.save();
    
    // Aktualisierte Voting-Daten senden
    res.status(200).json({
      status: 'success',
      data: {
        id: voting._id,
        name: voting.name,
        timeLeft: getTimeLeftString(voting.endTime),
        options: voting.options.map(option => ({
          id: option._id,
          name: option.name,
          percentage: calculateVotePercentage(option.votes, voting.options)
        }))
      }
    });
  } catch (err) {
    next(new AppError(`Fehler beim Abstimmen: ${err.message}`, 500));
  }
};

/**
 * Notfall/Hilferuf melden
 */
exports.reportEmergency = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { eventId, type, message, latitude, longitude } = sanitize.requestBody(req.body);
    
    if (!eventId || !type || !latitude || !longitude) {
      return next(new AppError('Unvollständige Notfalldaten', 400));
    }
    
    // Neuen Notfall erstellen
    const emergency = await Emergency.create({
      userId,
      eventId,
      type,
      message: message || '',
      location: {
        latitude,
        longitude
      },
      status: 'pending',
      severity: determineSeverity(type),
      createdAt: new Date()
    });
    
    // Notfall an alle Admins und Security-Personal senden würde hier passieren
    // (WebSocket/Realtime-Service)
    
    res.status(201).json({
      status: 'success',
      data: {
        id: emergency._id,
        type: emergency.type,
        status: emergency.status,
        createdAt: emergency.createdAt
      }
    });
  } catch (err) {
    next(new AppError(`Fehler beim Melden des Notfalls: ${err.message}`, 500));
  }
};

/**
 * Status eines Notrufs holen
 */
exports.getEmergencyStatus = async (req, res, next) => {
  try {
    const { emergencyId } = req.params;
    const userId = req.user._id;
    
    // Notfall finden
    const emergency = await Emergency.findOne({
      _id: emergencyId,
      userId
    });
    
    if (!emergency) {
      return next(new AppError('Notfall nicht gefunden', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        id: emergency._id,
        type: emergency.type,
        status: emergency.status,
        message: emergency.message,
        location: emergency.location,
        createdAt: emergency.createdAt,
        responderId: emergency.responderId,
        responderType: emergency.responderType,
        estimatedResponseTime: emergency.estimatedResponseTime,
        resolvedAt: emergency.resolvedAt
      }
    });
  } catch (err) {
    next(new AppError(`Fehler beim Abrufen des Notfallstatus: ${err.message}`, 500));
  }
};

/**
 * Status eines Notrufs aktualisieren
 */
exports.updateEmergencyStatus = async (req, res, next) => {
  try {
    const { emergencyId } = req.params;
    const userId = req.user._id;
    const { status } = sanitize.requestBody(req.body);
    
    if (!status) {
      return next(new AppError('Status ist erforderlich', 400));
    }
    
    // Notfall finden
    const emergency = await Emergency.findOne({
      _id: emergencyId,
      userId
    });
    
    if (!emergency) {
      return next(new AppError('Notfall nicht gefunden', 404));
    }
    
    // Nur bestimmte Status-Übergänge erlauben
    const validTransitions = {
      'pending': ['cancelled'],
      'accepted': ['resolved', 'cancelled'],
      'resolved': []
    };
    
    if (!validTransitions[emergency.status]?.includes(status)) {
      return next(new AppError(`Ungültiger Status-Übergang von ${emergency.status} zu ${status}`, 400));
    }
    
    // Status aktualisieren
    emergency.status = status;
    
    if (status === 'resolved' || status === 'cancelled') {
      emergency.resolvedAt = new Date();
    }
    
    await emergency.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        id: emergency._id,
        status: emergency.status,
        resolvedAt: emergency.resolvedAt
      }
    });
  } catch (err) {
    next(new AppError(`Fehler beim Aktualisieren des Notfallstatus: ${err.message}`, 500));
  }
};

/**
 * Personal-Standorte holen (nur für Admins/Moderatoren)
 */
exports.getStaffLocations = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    // Alle Security- und Staff-Benutzer für dieses Event finden
    const staffUsers = await User.find({
      userRole: { $in: ['moderator', 'admin'] }
    });
    
    const staffIds = staffUsers.map(user => user._id);
    
    // Standorte des Personals holen
    const staffLocations = await UserLocation.find({
      userId: { $in: staffIds },
      eventId,
      updatedAt: { $gte: new Date(Date.now() - 300000) } // Letzte 5 Minuten
    }).populate('userId', 'username userRole');
    
    // Nach Typ gruppieren
    const security = [];
    const staff = [];
    
    staffLocations.forEach(loc => {
      const item = {
        id: loc.userId._id,
        name: loc.userId.username,
        position: [loc.latitude, loc.longitude],
        status: determineStaffStatus(loc)
      };
      
      if (loc.userId.userRole === 'admin') {
        security.push(item);
      } else {
        staff.push(item);
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        security,
        staff
      }
    });
  } catch (err) {
    next(new AppError(`Fehler beim Laden der Personalstandorte: ${err.message}`, 500));
  }
};

/**
 * Ankündigung an Event-Teilnehmer senden
 */
exports.sendAnnouncement = async (req, res, next) => {
  try {
    const { eventId, title, message, targets, priority } = sanitize.requestBody(req.body);
    
    if (!eventId || !title || !message || !targets || !priority) {
      return next(new AppError('Unvollständige Ankündigungsdaten', 400));
    }
    
    // Ankündigung in Datenbank speichern
    // Hier würde ein Announcement-Modell verwendet werden
    
    // Ankündigung an Zielgruppe senden würde hier über WebSockets erfolgen
    
    res.status(200).json({
      status: 'success',
      message: 'Ankündigung erfolgreich gesendet'
    });
  } catch (err) {
    next(new AppError(`Fehler beim Senden der Ankündigung: ${err.message}`, 500));
  }
};

/**
 * Event-Analytics holen
 */
exports.getEventAnalytics = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    // Event-Daten laden
    const Event = require('../models/Event'); // Event-Modell separat importieren
    const event = await Event.findById(eventId);
    
    if (!event) {
      return next(new AppError('Event nicht gefunden', 404));
    }
    
    // Anzahl der Benutzer auf dem Event berechnen
    const userCount = await UserLocation.countDocuments({
      eventId,
      updatedAt: { $gte: new Date(Date.now() - 3600000) } // Letzte Stunde
    });
    
    // Weitere Analytics-Daten sammeln
    // (In einer echten App würden hier viele weitere Daten abgefragt)
    
    res.status(200).json({
      status: 'success',
      data: {
        totalVisitors: userCount,
        // Weitere Analytics-Daten
      }
    });
  } catch (err) {
    next(new AppError(`Fehler beim Laden der Event-Analytics: ${err.message}`, 500));
  }
};

// ========= Hilfsfunktionen ==========

/**
 * Berechnet die Zeit bis zum Ende eines Votings als String
 */
function getTimeLeftString(endTime) {
  const timeLeft = endTime - new Date();
  
  if (timeLeft <= 0) return '0:00';
  
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Berechnet den Prozentsatz für eine Voting-Option
 */
function calculateVotePercentage(votes, allOptions) {
  const totalVotes = allOptions.reduce((sum, option) => sum + option.votes, 0);
  
  if (totalVotes === 0) return 0;
  
  return Math.round((votes / totalVotes) * 100);
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

/**
 * Bestimmt den Status des Personals basierend auf der letzten Aktivität
 */
function determineStaffStatus(location) {
  // In einer echten App würde hier die Bewegungsgeschwindigkeit, 
  // aktuelle Aufgaben usw. berücksichtigt werden
  const lastActivity = new Date() - location.updatedAt;
  
  if (lastActivity < 60000) { // Letzte Minute
    return 'patrol';
  } else if (lastActivity < 180000) { // Letzte 3 Minuten
    return 'stationary';
  } else {
    return 'response';
  }
}