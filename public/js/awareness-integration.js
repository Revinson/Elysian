/**
 * awareness-integration.js
 * Integriert die Awareness-Funktionen in die bestehende Kartenanwendung
 */

// Awareness-Funktionen werden initialisiert, sobald die Karte geladen ist
document.addEventListener('DOMContentLoaded', () => {
    // Warten bis die Basiskarte geladen ist
    const checkMapInterval = setInterval(() => {
      if (typeof map !== 'undefined' && map !== null) {
        clearInterval(checkMapInterval);
        
        // Live-Pulse Manager initialisieren
        if (typeof initLivePulse === 'function') {
          window.pulseMgr = initLivePulse(map);
          console.log('Live-Pulse Manager initialisiert');
        }
        
        // Initialisierung der Awareness-Funktionen
        initAwarenessFeatures();
      }
    }, 100);
  });
  
  /**
   * Initialisiert alle Awareness-Funktionen
   */
  function initAwarenessFeatures() {
    // Event-Listener für den SOS-Button
    document.getElementById('sos-btn').addEventListener('click', () => {
      document.getElementById('sos-modal').classList.remove('hidden');
    });
    
    // Schließen-Button für SOS-Modal
    document.getElementById('close-sos-modal').addEventListener('click', () => {
      document.getElementById('sos-modal').classList.add('hidden');
    });
    
    // SOS-Option auswählen
    document.querySelectorAll('.sos-option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Alle deaktivieren
        document.querySelectorAll('.sos-option-btn').forEach(b => {
          b.classList.remove('selected');
        });
        
        // Ausgewählte aktivieren
        e.currentTarget.classList.add('selected');
      });
    });
    
    // SOS-Anfrage senden
    document.getElementById('send-sos').addEventListener('click', () => {
      const selectedOption = document.querySelector('.sos-option-btn.selected');
      
      if (!selectedOption) {
        alert('Bitte wähle eine Option aus.');
        return;
      }
      
      const requestType = selectedOption.getAttribute('data-type');
      const message = document.getElementById('sos-message').value.trim();
      
      // Nutzerposition holen (in einer echten App: GPS)
      if (!userMarker) {
        alert('Deine Position konnte nicht ermittelt werden.');
        return;
      }
      
      const position = userMarker.getLatLng();
      
      // SOS-Anfrage senden
      sendSOSRequest(requestType, message, position);
      
      // Modal schließen
      document.getElementById('sos-modal').classList.add('hidden');
    });
    
    // Toggle für Awareness-Team auf der Karte
    document.getElementById('toggle-awareness').addEventListener('click', () => {
      const btn = document.getElementById('toggle-awareness');
      const isActive = btn.classList.toggle('active');
      
      // Awareness-Teams ein-/ausblenden
      toggleAwarenessTeams(isActive);
    });
    
    // Safe-Zones laden
    loadSafeZones();
    
    // Event Source für Echtzeit-Updates einrichten
    setupEventSource();
  }
  
  /**
   * Lädt die Safe-Zones vom Server
   */
  function loadSafeZones() {
    // In einer echten App: API-Call zum Server
    // Hier: Mock-Daten für die Demo
    
    // Verzögerung simulieren
    setTimeout(() => {
      // Safe Zones für die Demo
      const safeZones = [
        {
          id: 'safezone-1',
          name: 'Haupt-Awareness-Zone',
          type: 'safezone',
          safeType: 'medical',
          coordinates: [51.4549, 7.0125],
          description: 'Erste Hilfe und Awareness-Team',
          team: {
            id: 'team-1',
            status: 'active',
            capacity: {
              total: 5,
              current: 3
            },
            services: ['escort', 'medical-basic', 'rest-area', 'water'],
            memberCount: 3,
            availableMembers: 2,
            openingHours: {
              from: '22:00',
              to: '06:00'
            }
          }
        },
        {
          id: 'safezone-2',
          name: 'Chill-Out Zone',
          type: 'safezone',
          safeType: 'rest',
          coordinates: [51.4558, 7.0130],
          description: 'Ruhiger Bereich zum Entspannen',
          team: {
            id: 'team-2',
            status: 'limited',
            capacity: {
              total: 3,
              current: 1
            },
            services: ['rest-area', 'water'],
            memberCount: 2,
            availableMembers: 1,
            openingHours: {
              from: '22:00',
              to: '06:00'
            }
          }
        },
        {
          id: 'safezone-3',
          name: 'Eingangsbereich Safe Zone',
          type: 'safezone',
          safeType: 'information',
          coordinates: [51.4540, 7.0110],
          description: 'Information und Hilfe am Eingang',
          team: {
            id: 'team-3',
            status: 'active',
            capacity: {
              total: 4,
              current: 4
            },
            services: ['information', 'escort', 'water'],
            memberCount: 4,
            availableMembers: 3,
            openingHours: {
              from: '21:00',
              to: '06:00'
            }
          }
        }
      ];
      
      // Safe Zones auf der Karte anzeigen
      displaySafeZones(safeZones);
      
    }, 500);
  }
  
  /**
   * Zeigt die Safe Zones auf der Karte an
   */
  function displaySafeZones(safeZones) {
    // Awareness-Team-Marker-Layer (falls noch nicht vorhanden)
    if (!window.awarenessLayer) {
      window.awarenessLayer = L.layerGroup();
      window.awarenessMarkers = {};
      window.safeZoneData = {};
    }
    
    safeZones.forEach(zone => {
      // Safe Zone-Daten speichern
      window.safeZoneData[zone.id] = zone;
      
      // Als Marker anzeigen
      const marker = L.marker(zone.coordinates, {
        icon: L.divIcon({
          className: 'safe-zone-marker',
          html: `<div class="safe-zone-marker ${zone.team?.status || 'inactive'}">
                  <i class="fas fa-shield-alt"></i>
                </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        })
      });
      
      // Marker speichern
      window.awarenessMarkers[zone.id] = marker;
      
      // Info-Popup hinzufügen
      marker.bindPopup(createSafeZonePopupContent(zone));
      
      // Zum Layer hinzufügen
      window.awarenessLayer.addLayer(marker);
      
      // Puls-Effekt hinzufügen, wenn Team aktiv ist
      if (window.pulseMgr && zone.team) {
        if (zone.team.status === 'active') {
          window.pulseMgr.addPersistentPulse(`safezone-${zone.id}`, marker, {
            color: '#4caf50',
            fillColor: '#4caf50',
            radius: 5,
            maxRadius: 20,
            intensity: 0.5
          });
        } else if (zone.team.status === 'limited') {
          window.pulseMgr.addPersistentPulse(`safezone-${zone.id}`, marker, {
            color: '#ffdd57',
            fillColor: '#ffdd57',
            radius: 5,
            maxRadius: 15,
            intensity: 0.4
          });
        }
      }
    });
    
    // Event-Handler für SOS-Buttons
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('send-sos-btn') || e.target.parentElement.classList.contains('send-sos-btn')) {
        const button = e.target.classList.contains('send-sos-btn') ? e.target : e.target.parentElement;
        const zoneId = button.getAttribute('data-zone-id');
        
        // SOS-Modal öffnen mit vorausgewählter Safe Zone
        openSOSModal(zoneId);
      }
    });
    
    // Wenn Toggle aktiv ist, Layer anzeigen
    if (document.getElementById('toggle-awareness').classList.contains('active')) {
      map.addLayer(window.awarenessLayer);
    }
  }
  
  /**
   * Erstellt den Inhalt für das Safe Zone Popup
   */
  function createSafeZonePopupContent(zone) {
    const statusText = {
      'active': 'Aktiv und bereit',
      'limited': 'Eingeschränkt verfügbar',
      'closed': 'Geschlossen'
    };
    
    const serviceIcons = {
      'escort': 'fa-walking',
      'medical-basic': 'fa-band-aid',
      'medical-advanced': 'fa-medkit',
      'water': 'fa-tint',
      'rest-area': 'fa-bed',
      'charging': 'fa-charging-station',
      'information': 'fa-info-circle',
      'drug-safety': 'fa-capsules'
    };
    
    const serviceNames = {
      'escort': 'Begleitung',
      'medical-basic': 'Erste Hilfe',
      'medical-advanced': 'Sanitäter',
      'water': 'Wasserstelle',
      'rest-area': 'Ruhebereich',
      'charging': 'Handy-Ladestation',
      'information': 'Information',
      'drug-safety': 'Drug-Checking'
    };
    
    return `
      <div class="safe-zone-popup">
        <h3>${zone.name}</h3>
        <p>${zone.description || 'Safe Zone für Unterstützung und Hilfe'}</p>
        ${zone.team ? `
          <div class="team-info">
            <p>
              <strong>Status:</strong> 
              <span class="team-status ${zone.team.status}">${statusText[zone.team.status] || 'Unbekannt'}</span>
            </p>
            <p><strong>Services:</strong></p>
            <div class="services-list">
              ${zone.team.services.map(service => `
                <span class="service-tag">
                  <i class="fas ${serviceIcons[service] || 'fa-check'}"></i>
                  ${serviceNames[service] || service}
                </span>
              `).join('')}
            </div>
            <p><strong>Team-Mitglieder:</strong> ${zone.team.availableMembers}/${zone.team.memberCount} verfügbar</p>
            ${zone.team.openingHours ? `
              <p><strong>Öffnungszeiten:</strong> ${zone.team.openingHours.from} - ${zone.team.openingHours.to}</p>
            ` : ''}
          </div>
          <button class="send-sos-btn" data-zone-id="${zone.id}" ${zone.team.status === 'closed' ? 'disabled' : ''}>
            <i class="fas fa-hands-helping"></i>
            SOS an dieses Team senden
          </button>
        ` : `
          <p class="inactive-text">Aktuell nicht besetzt</p>
        `}
      </div>
    `;
  }
  
  /**
   * Blendet Awareness-Teams ein oder aus
   */
  function toggleAwarenessTeams(show) {
    if (!window.awarenessLayer) return;
    
    if (show) {
      map.addLayer(window.awarenessLayer);
    } else {
      map.removeLayer(window.awarenessLayer);
    }
  }
  
  /**
   * Öffnet das SOS-Modal mit vorausgewählter Safe Zone
   */
  function openSOSModal(zoneId) {
    // SOS-Modal anzeigen
    document.getElementById('sos-modal').classList.remove('hidden');
    
    // Safe Zone-ID speichern
    document.getElementById('send-sos').setAttribute('data-zone-id', zoneId);
    
    // Safe Zone-Name im Modal anzeigen
    const zone = window.safeZoneData[zoneId];
    if (zone) {
      const modalHeader = document.querySelector('#sos-modal .modal-header h2');
      modalHeader.innerHTML = `<i class="fas fa-hands-helping"></i> SOS an Team: ${zone.name}`;
    }
  }
  
  /**
   * Sendet eine SOS-Anfrage an den Server
   */
  function sendSOSRequest(type, message, position) {
    // In einer echten App: API-Call zum Server
    // Hier: Simulierte Antwort
    
    console.log(`SOS-Anfrage: Typ ${type}, Nachricht: ${message}, Position: [${position.lat}, ${position.lng}]`);
    
    // Erfolgsbenachrichtigung
    alert('Deine SOS-Anfrage wurde gesendet. Ein Awareness-Team-Mitglied wird informiert.');
    
    // Puls-Effekt an der Position des Benutzers
    if (window.pulseMgr) {
      window.pulseMgr.alert([position.lat, position.lng], '#4caf50');
    }
    
    // Simulierte Antwort nach Verzögerung
    setTimeout(() => {
      showSOSResponseStatus({
        status: 'accepted',
        safeZone: {
          id: 'safezone-1',
          name: 'Haupt-Awareness-Zone',
          coordinates: [51.4549, 7.0125]
        },
        responder: {
          id: 'team-member-1',
          name: 'Max',
          role: 'Awareness-Team',
          estimatedTime: '3 Minuten'
        },
        message: 'Ein Team-Mitglied ist auf dem Weg zu dir. Bitte bleibe wenn möglich an deiner aktuellen Position.'
      });
    }, 3000);
  }
  
  /**
   * Zeigt den Status einer SOS-Antwort an
   */
  function showSOSResponseStatus(response) {
    // SOS-Status-Element erstellen, falls noch nicht vorhanden
    let sosStatus = document.getElementById('sos-status');
    
    if (!sosStatus) {
      sosStatus = document.createElement('div');
      sosStatus.id = 'sos-status';
      sosStatus.className = 'sos-status';
      document.body.appendChild(sosStatus);
      
      // Schließen-Handler
      sosStatus.addEventListener('click', (e) => {
        if (e.target.id === 'close-sos-status' || e.target.closest('#close-sos-status')) {
          sosStatus.classList.remove('active');
        }
      });
    }
    
    // Inhalt setzen
    sosStatus.innerHTML = `
      <div class="sos-status-header">
        <h3>SOS-Status: ${response.status === 'accepted' ? 'Hilfe ist unterwegs' : 'Gesendet'}</h3>
        <button id="close-sos-status" class="close-btn"><i class="fas fa-times"></i></button>
      </div>
      <div class="sos-response-info">
        <h4>Team: ${response.safeZone.name}</h4>
        ${response.responder ? `
          <div class="responder-info">
            <div class="responder-avatar">
              <i class="fas fa-user-shield"></i>
            </div>
            <div class="responder-details">
              <p><strong>${response.responder.name}</strong> (${response.responder.role})</p>
              <p class="estimated-time">Geschätzte Ankunft: ${response.responder.estimatedTime}</p>
            </div>
          </div>
        ` : ''}
        <p>${response.message}</p>
      </div>
      <button id="resolve-sos" class="neon-btn">Hilfe erhalten / Problem gelöst</button>
    `;
    
    // Lösung-Button
    sosStatus.querySelector('#resolve-sos').addEventListener('click', () => {
      // In einer echten App: API-Call zum Server
      alert('Vielen Dank für deine Rückmeldung. Wir hoffen, dass dir geholfen werden konnte.');
      sosStatus.classList.remove('active');
    });
    
    // Anzeigen
    sosStatus.classList.add('active');
    
    // Route zur Safe Zone auf der Karte anzeigen
    if (response.safeZone.coordinates && userMarker) {
      const userPos = userMarker.getLatLng();
      
      // Linie zwischen Benutzer und Safe Zone
      const routeLine = L.polyline([
        [userPos.lat, userPos.lng],
        response.safeZone.coordinates
      ], {
        color: '#4caf50',
        weight: 3,
        opacity: 0.8,
        dashArray: '10, 10',
        lineCap: 'round'
      }).addTo(map);
      
      // Nach 30 Sekunden entfernen
      setTimeout(() => {
        map.removeLayer(routeLine);
      }, 30000);
    }
  }
  
  /**
   * Richtet eine EventSource für Echtzeit-Updates ein
   */
  function setupEventSource() {
    // In einer echten App: SSE vom Server
    // Für die Demo: Verzögerter Aufruf simulieren
    
    setTimeout(() => {
      // Simuliere ein Notfallereignis
      if (window.pulseMgr) {
        // Position in der Nähe der Karte
        const emergencyPos = [51.4543, 7.0153];
        
        // Puls-Effekt erstellen
        window.pulseMgr.alert(emergencyPos, '#f44336');
        
        // Benachrichtigung
        showEmergencyNotification({
          type: 'medical',
          location: emergencyPos,
          message: 'Medizinischer Notfall beim Second Floor',
          severity: 'high'
        });
      }
    }, 20000);
  }
  
  /**
   * Zeigt eine Notfall-Benachrichtigung an
   */
  function showEmergencyNotification(data) {
    // Nur für Organisatoren/Moderatoren anzeigen
    // In einer echten App: Rollencheck
    
    // Benachrichtigung erstellen
    const notification = document.createElement('div');
    notification.className = 'emergency-notification';
    notification.innerHTML = `
      <div class="notification-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <div class="notification-content">
        <h4>Notfall: ${data.type === 'medical' ? 'Medizinisch' : 'Security'}</h4>
        <p>${data.message}</p>
      </div>
      <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // An Body anhängen
    document.body.appendChild(notification);
    
    // Klick-Event zum Schließen
    notification.querySelector('.notification-close').addEventListener('click', () => {
      document.body.removeChild(notification);
    });
    
    // Nach 10 Sekunden automatisch entfernen
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 10000);
  }