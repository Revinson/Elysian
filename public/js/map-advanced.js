// map-advanced.js - Erweiterte Funktionen für die Elysium-Karte
// Diese Datei ergänzt die grundlegenden Funktionen aus map.js

// =====================
// WebSocket-Verbindung für Echtzeit-Updates
// =====================

// In einer echten Anwendung würde hier eine WebSocket-Verbindung aufgebaut
// In dieser Demo simulieren wir die Echtzeit-Updates

class ElysiumRealtime {
    constructor() {
      this.connected = false;
      this.listeners = {
        'user_moved': [],
        'friend_moved': [],
        'crowd_update': [],
        'vote_update': [],
        'emergency': []
      };
      
      // Simulierte Verbindung nach Timeout
      setTimeout(() => {
        this.connected = true;
        this.startSimulation();
        console.log('Echtzeit-Verbindung hergestellt (simuliert)');
      }, 1000);
    }
    
    // Event-Listener hinzufügen
    on(event, callback) {
      if (this.listeners[event]) {
        this.listeners[event].push(callback);
        return true;
      }
      return false;
    }
    
    // Event auslösen
    trigger(event, data) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(callback => {
          callback(data);
        });
        return true;
      }
      return false;
    }
    
    // Demo: Simulierte Echtzeit-Updates
    startSimulation() {
      // 1. Freunde-Bewegungen
      setInterval(() => {
        if (!this.connected) return;
        
        // Zufälligen Freund auswählen
        const friends = ['TechnoTim', 'BassQueen'];
        const randomFriend = friends[Math.floor(Math.random() * friends.length)];
        
        // Neue Position (kleine Verschiebung)
        const friendData = {
          id: randomFriend === 'TechnoTim' ? 'friend-1' : 'friend-2',
          name: randomFriend,
          coordinates: [
            52.5196 + (Math.random() - 0.5) * 0.001,
            13.4050 + (Math.random() - 0.5) * 0.001
          ]
        };
        
        // Event auslösen
        this.trigger('friend_moved', friendData);
      }, 5000);
      
      // 2. Crowd-Updates (Heatmap)
      setInterval(() => {
        if (!this.connected) return;
        
        // Simuliere Bewegung von Menschenmengen
        const heatmapData = [];
        
        // Hauptbereich mit vielen Leuten
        for (let i = 0; i < 30; i++) {
          heatmapData.push({
            lat: 52.5198 + (Math.random() - 0.5) * 0.001,
            lng: 13.4054 + (Math.random() - 0.5) * 0.001,
            count: Math.floor(Math.random() * 50) + 50 // 50-100
          });
        }
        
        // Zweiter Bereich mit weniger Leuten
        for (let i = 0; i < 20; i++) {
          heatmapData.push({
            lat: 52.5204 + (Math.random() - 0.5) * 0.001,
            lng: 13.4053 + (Math.random() - 0.5) * 0.001,
            count: Math.floor(Math.random() * 30) + 20 // 20-50
          });
        }
        
        // Bar-Bereich
        for (let i = 0; i < 10; i++) {
          heatmapData.push({
            lat: 52.5197 + (Math.random() - 0.5) * 0.0005,
            lng: 13.4048 + (Math.random() - 0.5) * 0.0005,
            count: Math.floor(Math.random() * 20) + 10 // 10-30
          });
        }
        
        // Event auslösen
        this.trigger('crowd_update', heatmapData);
      }, 10000);
      
      // 3. Voting-Updates
      setInterval(() => {
        if (!this.connected) return;
        
        // Aktualisierte Voting-Daten
        const votingUpdate = {
          id: 'voting-main',
          options: [
            { 
              id: 'opt1', 
              name: 'Hard Techno', 
              percentage: 70 + Math.floor(Math.random() * 10) // 70-80%
            },
            { 
              id: 'opt2', 
              name: 'Melodic Techno', 
              percentage: 10 + Math.floor(Math.random() * 10) // 10-20%
            },
            { 
              id: 'opt3', 
              name: 'Tech House', 
              percentage: 5 + Math.floor(Math.random() * 10) // 5-15%
            }
          ],
          timeLeft: Math.floor(Math.random() * 3) + ':' + Math.floor(Math.random() * 60).toString().padStart(2, '0')
        };
        
        // Event auslösen
        this.trigger('vote_update', votingUpdate);
      }, 15000);
      
      // 4. Gelegentlich ein neues Voting starten
      setTimeout(() => {
        if (!this.connected) return;
        
        // Neues Voting
        const newVoting = {
          id: 'voting-second',
          name: 'DJ Wahl (Second Floor)',
          coordinates: [52.5204, 13.4050],
          timeLeft: '5:00',
          options: [
            { id: 'dj1', name: 'DJ Amelia', percentage: 45 },
            { id: 'dj2', name: 'Neon Dreams', percentage: 35 },
            { id: 'dj3', name: 'Pulse Collective', percentage: 20 }
          ]
        };
        
        // Event auslösen (wir nutzen dasselbe Event wie für Updates)
        this.trigger('vote_update', newVoting);
      }, 30000);
      
      // 5. Simulierter Notfall (nach einer Minute)
      setTimeout(() => {
        if (!this.connected) return;
        
        // Notfall-Daten
        const emergency = {
          type: 'medical',
          location: [52.5196, 13.4060],
          message: 'Ein Gast benötigt medizinische Hilfe in der Nähe des Chill-Out-Bereichs',
          severity: 'medium', // low, medium, high
          resolved: false
        };
        
        // Event auslösen
        this.trigger('emergency', emergency);
      }, 60000);
    }
    
    // Simulierte Methode zum Senden einer Abstimmung
    sendVote(votingId, optionId) {
      if (!this.connected) return false;
      
      console.log(`Sende Abstimmung: Voting ${votingId}, Option ${optionId}`);
      // In einer echten App: API-Call zum Server
      
      return true;
    }
    
    // Simulierte Methode zum Senden eines Hilferufs
    sendEmergencyRequest(type, message, location) {
      if (!this.connected) return false;
      
      console.log(`Sende Notfall: Typ ${type}, Nachricht: ${message}`);
      // In einer echten App: API-Call zum Server
      
      // Simulierte Antwort nach kurzer Zeit
      setTimeout(() => {
        const response = {
          id: 'emergency-' + Math.floor(Math.random() * 1000),
          status: 'accepted',
          estimatedResponseTime: '3 Minuten',
          responderType: type === 'medical' ? 'Sanitäter' : 'Security'
        };
        
        // Event für UI-Update auslösen
        this.trigger('emergency', {
          ...response,
          isResponse: true
        });
      }, 2000);
      
      return true;
    }
    
    // Verbindung trennen
    disconnect() {
      this.connected = false;
      console.log('Echtzeit-Verbindung getrennt');
    }
  }
  
  // =====================
  // Organisator-Tools (Nur für Event-Creator & Staff sichtbar)
  // =====================
  
  class OrganizerTools {
    constructor(mapInstance, realtime) {
      this.map = mapInstance;
      this.realtime = realtime;
      this.isActive = false;
      this.securityMarkers = [];
      this.staffMarkers = [];
      this.analyticsData = {};
      
      // In einer echten App: Rollen-Check über API
      // Hier: Immer aktivieren für Demo
      this.checkAccess();
    }
    
    // Zugriff prüfen
    checkAccess() {
      // In einer echten App: API-Call mit JWT zum Server
      // Hier: Simulieren, dass der Nutzer Organisator ist
      setTimeout(() => {
        this.isActive = true;
        this.initOrganizerUI();
        console.log('Organisator-Tools aktiviert');
      }, 2000);
    }
    
    // UI für Organisatoren initialisieren
    initOrganizerUI() {
      if (!this.isActive) return;
      
      // Neuer Bereich für Organisator-Tools in der Seitenleiste
      const mapControls = document.querySelector('.map-controls');
      
      if (!mapControls) return;
      
      const organiverDiv = document.createElement('div');
      organiverDiv.className = 'control-group organizer-controls';
      organiverDiv.innerHTML = `
        <h3><i class="fas fa-user-shield"></i> Organizer Tools</h3>
        <button id="toggle-security" class="map-btn"><i class="fas fa-shield-alt"></i> Security-Team anzeigen</button>
        <button id="toggle-staff" class="map-btn"><i class="fas fa-headset"></i> Staff anzeigen</button>
        <button id="toggle-analytics" class="map-btn"><i class="fas fa-chart-bar"></i> Live-Statistiken</button>
        <button id="send-announcement" class="map-btn"><i class="fas fa-bullhorn"></i> Ankündigung senden</button>
      `;
      
      mapControls.appendChild(organiverDiv);
      
      // Event-Listener hinzufügen
      document.getElementById('toggle-security').addEventListener('click', () => this.toggleSecurityView());
      document.getElementById('toggle-staff').addEventListener('click', () => this.toggleStaffView());
      document.getElementById('toggle-analytics').addEventListener('click', () => this.toggleAnalytics());
      document.getElementById('send-announcement').addEventListener('click', () => this.showAnnouncementDialog());
      
      // Notfall-Events abonnieren
      this.realtime.on('emergency', (data) => this.handleEmergency(data));
      
      // Security und Personal laden
      this.loadSecurityStaff();
    }
    
    // Security-Team ein-/ausblenden
    toggleSecurityView() {
      const button = document.getElementById('toggle-security');
      const isActive = button.classList.toggle('active');
      
      // Marker ein-/ausblenden
      this.securityMarkers.forEach(marker => {
        if (isActive) {
          this.map.addLayer(marker);
        } else if (this.map.hasLayer(marker)) {
          this.map.removeLayer(marker);
        }
      });
    }
    
    // Event-Staff ein-/ausblenden
    toggleStaffView() {
      const button = document.getElementById('toggle-staff');
      const isActive = button.classList.toggle('active');
      
      // Marker ein-/ausblenden
      this.staffMarkers.forEach(marker => {
        if (isActive) {
          this.map.addLayer(marker);
        } else if (this.map.hasLayer(marker)) {
          this.map.removeLayer(marker);
        }
      });
    }
    
    // Analytics-Overlay anzeigen
    toggleAnalytics() {
      const button = document.getElementById('toggle-analytics');
      button.classList.toggle('active');
      
      // Wenn das Overlay noch nicht existiert, erstellen
      let analyticsOverlay = document.getElementById('analytics-overlay');
      
      if (!analyticsOverlay) {
        analyticsOverlay = document.createElement('div');
        analyticsOverlay.id = 'analytics-overlay';
        analyticsOverlay.className = 'map-overlay analytics-overlay hidden';
        analyticsOverlay.innerHTML = `
          <div class="overlay-header">
            <h3><i class="fas fa-chart-bar"></i> Live Event Analytics</h3>
            <button id="close-analytics" class="close-btn"><i class="fas fa-times"></i></button>
          </div>
          <div class="overlay-content">
            <div class="stats-grid">
              <div class="stat-box">
                <h4>Besucher</h4>
                <div class="stat-value">537</div>
                <div class="stat-trend up">+24 in der letzten Stunde</div>
              </div>
              <div class="stat-box">
                <h4>Durchschn. Aufenthalt</h4>
                <div class="stat-value">2.3h</div>
                <div class="stat-trend up">+0.2h seit letztem Event</div>
              </div>
              <div class="stat-box">
                <h4>Main Floor</h4>
                <div class="stat-value">75%</div>
                <div class="stat-trend up">+5% Auslastung</div>
              </div>
              <div class="stat-box">
                <h4>Second Floor</h4>
                <div class="stat-value">62%</div>
                <div class="stat-trend down">-3% Auslastung</div>
              </div>
              <div class="stat-box">
                <h4>Bar Umsatz</h4>
                <div class="stat-value">4.2k €</div>
                <div class="stat-trend up">+18% im Vergleich zum Durchschnitt</div>
              </div>
              <div class="stat-box">
                <h4>Notfälle</h4>
                <div class="stat-value">3</div>
                <div class="stat-trend neutral">Alle bearbeitet</div>
              </div>
            </div>
            
            <div class="occupancy-timeline">
              <h4>Besucherentwicklung</h4>
              <div class="timeline-chart">
                <!-- In einer echten App: Chart-Bibliothek einbinden -->
                <div class="mock-chart">
                  <div class="chart-line" style="height: 30%;"></div>
                  <div class="chart-line" style="height: 40%;"></div>
                  <div class="chart-line" style="height: 55%;"></div>
                  <div class="chart-line" style="height: 70%;"></div>
                  <div class="chart-line" style="height: 80%;"></div>
                  <div class="chart-line" style="height: 75%;"></div>
                  <div class="chart-line" style="height: 85%;"></div>
                  <div class="chart-line active" style="height: 90%;"></div>
                </div>
                <div class="chart-labels">
                  <span>22:00</span>
                  <span>23:00</span>
                  <span>00:00</span>
                  <span>01:00</span>
                  <span>02:00</span>
                </div>
              </div>
            </div>
          </div>
        `;
        
        document.querySelector('.map-container').appendChild(analyticsOverlay);
        
        // Schließen-Button
        document.getElementById('close-analytics').addEventListener('click', () => {
          analyticsOverlay.classList.add('hidden');
          button.classList.remove('active');
        });
      }
      
      // Overlay anzeigen/ausblenden
      analyticsOverlay.classList.toggle('hidden');
      
      // In einer echten App: Daten vom Server laden
      this.loadAnalyticsData();
    }
    
    // Ankündigungs-Dialog anzeigen
    showAnnouncementDialog() {
      // Wenn das Modal noch nicht existiert, erstellen
      let announcementModal = document.getElementById('announcement-modal');
      
      if (!announcementModal) {
        announcementModal = document.createElement('div');
        announcementModal.id = 'announcement-modal';
        announcementModal.className = 'modal';
        announcementModal.innerHTML = `
          <div class="modal-content neon-card">
            <div class="modal-header">
              <h2><i class="fas fa-bullhorn"></i> Ankündigung senden</h2>
              <button id="close-announcement-modal" class="close-modal"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
              <p>Sende eine Ankündigung an alle Event-Teilnehmer</p>
              
              <div class="form-group">
                <label for="announcement-title">Titel:</label>
                <input type="text" id="announcement-title" placeholder="z.B. 'Wichtige Info'">
              </div>
              
              <div class="form-group">
                <label for="announcement-text">Nachricht:</label>
                <textarea id="announcement-text" placeholder="Deine Ankündigung..."></textarea>
              </div>
              
              <div class="form-group">
                <label>Zielgruppe:</label>
                <div class="checkbox-group">
                  <label>
                    <input type="checkbox" id="target-all" checked> Alle Teilnehmer
                  </label>
                  <label>
                    <input type="checkbox" id="target-main"> Main Floor
                  </label>
                  <label>
                    <input type="checkbox" id="target-second"> Second Floor
                  </label>
                </div>
              </div>
              
              <div class="form-group">
                <label>Priorität:</label>
                <div class="radio-group">
                  <label>
                    <input type="radio" name="priority" value="normal" checked> Normal
                  </label>
                  <label>
                    <input type="radio" name="priority" value="high"> Wichtig
                  </label>
                  <label>
                    <input type="radio" name="priority" value="emergency"> Notfall
                  </label>
                </div>
              </div>
              
              <button id="send-announcement-btn" class="neon-btn btn-animated">Ankündigung senden</button>
            </div>
          </div>
        `;
        
        document.body.appendChild(announcementModal);
        
        // Schließen-Button
        document.getElementById('close-announcement-modal').addEventListener('click', () => {
          announcementModal.classList.add('hidden');
        });
        
        // Absenden-Button
        document.getElementById('send-announcement-btn').addEventListener('click', () => {
          const title = document.getElementById('announcement-title').value.trim();
          const text = document.getElementById('announcement-text').value.trim();
          
          if (!title || !text) {
            alert('Bitte gib Titel und Nachricht ein.');
            return;
          }
          
          // In einer echten App: API-Call zum Server
          console.log(`Ankündigung: ${title} - ${text}`);
          
          // Bestätigung
          alert('Deine Ankündigung wurde gesendet!');
          
          // Modal schließen
          announcementModal.classList.add('hidden');
        });
      }
      
      // Modal anzeigen
      announcementModal.classList.remove('hidden');
    }
    
    // Security und Staff laden
    loadSecurityStaff() {
      // In einer echten App: API-Call zum Server
      // Hier: Demo-Daten
      
      // Security-Team Positionen (Demo)
      const securityPositions = [
        {
          id: 'security-1',
          name: 'Security 1',
          position: [52.5197, 13.4045],
          status: 'patrol'
        },
        {
          id: 'security-2',
          name: 'Security 2',
          position: [52.5200, 13.4053],
          status: 'stationary'
        },
        {
          id: 'security-3',
          name: 'Security 3',
          position: [52.5193, 13.4058],
          status: 'response'
        }
      ];
      
      // Staff-Positionen (Demo)
      const staffPositions = [
        {
          id: 'staff-1',
          name: 'Bar Staff 1',
          position: [52.5197, 13.4047],
          role: 'Bar'
        },
        {
          id: 'staff-2',
          name: 'Techniker 1',
          position: [52.5198, 13.4054],
          role: 'Technik'
        },
        {
          id: 'staff-3',
          name: 'Einlass',
          position: [52.5191, 13.4045],
          role: 'Einlass'
        }
      ];
      
      // Security-Marker erstellen
      securityPositions.forEach(security => {
        const color = security.status === 'response' ? '#ff0000' : 
                     security.status === 'patrol' ? '#ffaa00' : '#00ff00';
        
        const icon = L.divIcon({
          className: 'custom-marker marker-security',
          html: `<i class="fas fa-shield-alt" style="font-size: 20px; color: ${color}; text-shadow: 0 0 5px ${color};"></i>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        
        const marker = L.marker(security.position, {
          icon: icon
        });
        
        marker.bindTooltip(`${security.name} (${security.status})`);
        
        // Zur Liste hinzufügen (aber noch nicht zur Karte)
        this.securityMarkers.push(marker);
      });
      
      // Staff-Marker erstellen
      staffPositions.forEach(staff => {
        let icon;
        
        if (staff.role === 'Bar') {
          icon = L.divIcon({
            className: 'custom-marker marker-staff',
            html: '<i class="fas fa-glass-martini-alt" style="font-size: 20px; color: #00ffff; text-shadow: 0 0 5px #00ffff;"></i>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
        } else if (staff.role === 'Technik') {
          icon = L.divIcon({
            className: 'custom-marker marker-staff',
            html: '<i class="fas fa-wrench" style="font-size: 20px; color: #ffff00; text-shadow: 0 0 5px #ffff00;"></i>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
        } else {
          icon = L.divIcon({
            className: 'custom-marker marker-staff',
            html: '<i class="fas fa-id-card" style="font-size: 20px; color: #ffffff; text-shadow: 0 0 5px #ffffff;"></i>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
        }
        
        const marker = L.marker(staff.position, {
          icon: icon
        });
        
        marker.bindTooltip(`${staff.name} (${staff.role})`);
        
        // Zur Liste hinzufügen (aber noch nicht zur Karte)
        this.staffMarkers.push(marker);
      });
    }
    
    // Analytics-Daten laden
    loadAnalyticsData() {
      // In einer echten App: API-Call zum Server
      // Hier: Demo-Daten werden direkt im HTML angezeigt
      console.log('Analytics-Daten geladen (simuliert)');
    }
    
    // Notfall-Event behandeln
    handleEmergency(data) {
      if (data.isResponse) {
        // Antwort auf eigenen Notfall (wird von anderer Funktion behandelt)
        return;
      }
      
      // Neuen Notfall auf der Karte anzeigen
      const emergencyIcon = L.divIcon({
        className: 'custom-marker marker-emergency',
        html: '<i class="fas fa-exclamation-triangle" style="font-size: 24px; color: #ff0000; text-shadow: 0 0 8px #ff0000;"></i>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      
      const marker = L.marker(data.location, {
        icon: emergencyIcon
      }).addTo(this.map);
      
      marker.bindTooltip(`Notfall: ${data.type}`);
      
      // Popup mit Details
      marker.bindPopup(`
        <h3>Notfall - ${data.type === 'medical' ? 'Medizinisch' : 'Security'}</h3>
        <p>${data.message}</p>
        <p>Priorität: ${data.severity === 'high' ? 'Hoch' : data.severity === 'medium' ? 'Mittel' : 'Niedrig'}</p>
        <button id="emergency-response-btn" class="btn-rescue" style="width: 100%; margin-top: 10px;">Reagieren</button>
      `).openPopup();
      
      // Benachrichtigung für Organisatoren
      this.showEmergencyNotification(data);
      
      // Nach 30 Sekunden entfernen (in einer echten App würde das über Status-Updates laufen)
      setTimeout(() => {
        this.map.removeLayer(marker);
      }, 30000);
    }
    
    // Notfall-Benachrichtigung anzeigen
    showEmergencyNotification(data) {
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
  }
  
  // =====================
  // Notfall-Tracking & Kommunikation
  // =====================
  
  class EmergencySystem {
    constructor(mapInstance, realtime) {
      this.map = mapInstance;
      this.realtime = realtime;
      this.activeEmergencies = [];
      this.userEmergency = null;
      
      // Notfall-Events abonnieren
      this.realtime.on('emergency', (data) => this.handleEmergencyResponse(data));
    }
    
    // Notfall melden
    reportEmergency(type, message, location) {
      if (this.userEmergency) {
        alert('Du hast bereits einen aktiven Notfall gemeldet. Bitte warte auf Hilfe.');
        return false;
      }
      
      // In einer echten App: API-Call zum Server
      const success = this.realtime.sendEmergencyRequest(type, message, location);
      
      if (success) {
        // Status setzen
        this.userEmergency = {
          type,
          message,
          location,
          status: 'pending',
          createdAt: new Date()
        };
        
        // UI für wartenden Status anzeigen
        this.showEmergencyWaitingUI();
      }
      
      return success;
    }
    
    // Notfall-Antwort behandeln
    handleEmergencyResponse(data) {
      if (!data.isResponse || !this.userEmergency) return;
      
      // Notfall-Status aktualisieren
      this.userEmergency.status = data.status;
      this.userEmergency.responseTime = data.estimatedResponseTime;
      this.userEmergency.responderType = data.responderType;
      
      // UI aktualisieren
      this.updateEmergencyUI();
    }
    
    // Warte-UI für Notfall anzeigen
    showEmergencyWaitingUI() {
      // Notfall-Status-Container erstellen, wenn er noch nicht existiert
      let emergencyStatus = document.getElementById('emergency-status');
      
      if (!emergencyStatus) {
        emergencyStatus = document.createElement('div');
        emergencyStatus.id = 'emergency-status';
        emergencyStatus.className = 'emergency-status';
        document.body.appendChild(emergencyStatus);
      }
      
      // Inhalt setzen
      emergencyStatus.innerHTML = `
        <div class="emergency-status-header">
          <h3>Notfall gemeldet</h3>
          <button id="cancel-emergency-btn" class="close-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="emergency-status-content">
          <div class="status-indicator pending">
            <i class="fas fa-hourglass-half"></i> Warte auf Bestätigung...
          </div>
          <div class="emergency-details">
            <p><strong>Typ:</strong> ${this.userEmergency.type === 'medical' ? 'Medizinisch' : 
                               this.userEmergency.type === 'security' ? 'Security' :
                               this.userEmergency.type === 'friend' ? 'Freunde benachrichtigen' : 'Begleitung zum Ausgang'}</p>
            <p><strong>Gemeldet:</strong> ${new Date().toLocaleTimeString()}</p>
          </div>
          <div class="emergency-waiting-animation">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
      `;
      
      // Anzeigen
      emergencyStatus.classList.add('active');
      
      // Abbrechen-Button
      document.getElementById('cancel-emergency-btn').addEventListener('click', () => {
        this.cancelEmergency();
      });
    }
    
    // Notfall-UI aktualisieren, wenn eine Antwort kommt
    updateEmergencyUI() {
      // Notfall-Status-Container finden
      const emergencyStatus = document.getElementById('emergency-status');
      
      if (!emergencyStatus) return;
      
      // Inhalt basierend auf Status aktualisieren
      if (this.userEmergency.status === 'accepted') {
        emergencyStatus.querySelector('.emergency-status-content').innerHTML = `
          <div class="status-indicator accepted">
            <i class="fas fa-check-circle"></i> Hilfe ist unterwegs!
          </div>
          <div class="emergency-details">
            <p><strong>Typ:</strong> ${this.userEmergency.type === 'medical' ? 'Medizinisch' : 
                               this.userEmergency.type === 'security' ? 'Security' :
                               this.userEmergency.type === 'friend' ? 'Freunde benachrichtigen' : 'Begleitung zum Ausgang'}</p>
            <p><strong>Team:</strong> ${this.userEmergency.responderType}</p>
            <p><strong>Geschätzte Ankunft:</strong> ${this.userEmergency.responseTime}</p>
          </div>
          <p class="emergency-instruction">Bitte bleibe an deinem aktuellen Standort, falls möglich.</p>
          <button id="resolve-emergency-btn" class="neon-btn">Notfall behoben</button>
        `;
        
        // Notfall behoben Button
        document.getElementById('resolve-emergency-btn').addEventListener('click', () => {
          this.resolveEmergency();
        });
      } else if (this.userEmergency.status === 'resolved') {
        emergencyStatus.querySelector('.emergency-status-content').innerHTML = `
          <div class="status-indicator resolved">
            <i class="fas fa-check-circle"></i> Notfall behoben
          </div>
          <div class="emergency-details">
            <p>Dein Notfall wurde erfolgreich behoben.</p>
          </div>
          <button id="close-emergency-status-btn" class="neon-btn">Schließen</button>
        `;
        
        // Schließen Button
        document.getElementById('close-emergency-status-btn').addEventListener('click', () => {
          emergencyStatus.classList.remove('active');
          this.userEmergency = null;
        });
      }
    }
    
    // Notfall abbrechen
    cancelEmergency() {
      if (!this.userEmergency) return;
      
      // In einer echten App: API-Call zum Server
      console.log('Notfall abgebrochen');
      
      // Status zurücksetzen
      this.userEmergency = null;
      
      // UI schließen
      const emergencyStatus = document.getElementById('emergency-status');
      if (emergencyStatus) {
        emergencyStatus.classList.remove('active');
      }
    }
    
    // Notfall als behoben markieren
    resolveEmergency() {
      if (!this.userEmergency) return;
      
      // In einer echten App: API-Call zum Server
      console.log('Notfall behoben');
      
      // Status aktualisieren
      this.userEmergency.status = 'resolved';
      
      // UI aktualisieren
      this.updateEmergencyUI();
    }
  }
  
  // =====================
  // Integriere die erweiterten Funktionen in die Hauptanwendung
  // =====================
  
  document.addEventListener('DOMContentLoaded', () => {
    // Warte bis die Basiskarte geladen ist
    const checkMapInterval = setInterval(() => {
      if (typeof map !== 'undefined' && map !== null) {
        clearInterval(checkMapInterval);
        
        // Echtzeit-Verbindung initialisieren
        const realtime = new ElysiumRealtime();
        
        // Echtzeit-Events abonnieren
        realtime.on('friend_moved', (data) => {
          updateFriendPosition(data);
        });
        
        realtime.on('crowd_update', (data) => {
          updateHeatmapData(data);
        });
        
        realtime.on('vote_update', (data) => {
          handleVoteUpdate(data);
        });
        
        // Organisator-Tools initialisieren
        const organizerTools = new OrganizerTools(map, realtime);
        
        // Notfall-System initialisieren
        const emergencySystem = new EmergencySystem(map, realtime);
        
        // Rescue-Button mit Notfall-System verknüpfen
        document.getElementById('send-rescue').addEventListener('click', () => {
          const selectedOption = document.querySelector('.rescue-option-btn.selected');
          
          if (!selectedOption) {
            alert('Bitte wähle eine Option aus.');
            return;
          }
          
          const rescueType = selectedOption.getAttribute('data-type');
          const message = document.getElementById('rescue-message').value.trim();
          
          // Notfall über das Notfall-System melden
          emergencySystem.reportEmergency(rescueType, message, userMarker.getLatLng());
          
          // Modal schließen
          document.getElementById('rescue-modal').classList.add('hidden');
        });
        
        // Funktion zum Aktualisieren der Freundesposition
        function updateFriendPosition(data) {
          // Freundes-Marker finden
          const friendMarker = friendMarkers[data.id];
          
          // Wenn Marker existiert, Position aktualisieren
          if (friendMarker) {
            friendMarker.setLatLng(data.coordinates);
            
            // Auch in der UI aktualisieren
            const friendItems = document.querySelectorAll('.friend-item');
            for (const item of friendItems) {
              const nameEl = item.querySelector('.friend-name');
              if (nameEl && nameEl.textContent === data.name) {
                const locationEl = item.querySelector('.friend-location');
                if (locationEl) {
                  locationEl.textContent = 'Live auf der Karte';
                }
                break;
              }
            }
          }
        }
        
        // Funktion zum Behandeln von Voting-Updates
        function handleVoteUpdate(data) {
          // Bestehende Voting-Area finden
          const existingArea = votingAreas.find(area => area.id === data.id);
          
          if (existingArea) {
            // Bestehendes Voting aktualisieren
            existingArea.data.options = data.options;
            existingArea.data.timeLeft = data.timeLeft;
            
            // Wenn das Voting-Overlay gerade offen ist und dieses Voting anzeigt, aktualisieren
            const votingOverlay = document.getElementById('voting-overlay');
            if (!votingOverlay.classList.contains('hidden')) {
              const currentVotingId = votingOverlay.getAttribute('data-voting-id');
              
              if (currentVotingId === data.id) {
                // Overlay aktualisieren
                const options = votingOverlay.querySelector('.voting-options');
                options.innerHTML = data.options.map(option => `
                  <div class="vote-option">
                    <div class="vote-progress" style="width: ${option.percentage}%"></div>
                    <div class="vote-label">${option.name}</div>
                    <div class="vote-count">${option.percentage}%</div>
                    <button class="vote-btn neon-btn" data-id="${option.id}">Vote</button>
                  </div>
                `).join('');
                
                // Timer aktualisieren
                document.getElementById('voting-timer').textContent = data.timeLeft;
                
                // Vote-Button Event-Handler aktualisieren
                options.querySelectorAll('.vote-btn').forEach(btn => {
                  btn.addEventListener('click', (e) => {
                    const optionId = e.target.getAttribute('data-id');
                    realtime.sendVote(data.id, optionId);
                    
                    // Bestätigung
                    alert('Deine Stimme wurde gezählt!');
                    
                    // Overlay schließen
                    votingOverlay.classList.add('hidden');
                  });
                });
              }
            }
          } else {
            // Neues Voting hinzufügen
            addVotingArea([data]);
            
            // Benachrichtigung anzeigen
            showVotingNotification(data);
          }
        }
        
        // Benachrichtigung für neues Voting anzeigen
        function showVotingNotification(votingData) {
          // Benachrichtigung erstellen
          const notification = document.createElement('div');
          notification.className = 'voting-notification';
          notification.innerHTML = `
            <div class="notification-icon">
              <i class="fas fa-poll"></i>
            </div>
            <div class="notification-content">
              <h4>Neues Live-Voting</h4>
              <p>${votingData.name}</p>
            </div>
            <button class="vote-now-btn">Jetzt abstimmen</button>
            <button class="notification-close"><i class="fas fa-times"></i></button>
          `;
          
          // An Body anhängen
          document.body.appendChild(notification);
          
          // Klick-Event zum Abstimmen
          notification.querySelector('.vote-now-btn').addEventListener('click', () => {
            // Auf Karte zentrieren
            map.setView(votingData.coordinates, 19);
            
            // Voting-Overlay anzeigen
            showVotingOverlay(votingData.id);
            
            // Benachrichtigung schließen
            document.body.removeChild(notification);
          });
          
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
        
        console.log('Erweiterte Karten-Funktionen initialisiert');
      }
    }, 100);
  });
  
  // Füge CSS für die neuen Features hinzu
  const additionalStyles = document.createElement('style');
  additionalStyles.textContent = `
    /* Analytics Overlay */
    .analytics-overlay {
      width: 400px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .stat-box {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(193, 58, 252, 0.3);
      border-radius: 4px;
      padding: 10px;
    }
    
    .stat-box h4 {
      margin: 0 0 5px 0;
      font-size: 0.9rem;
      opacity: 0.8;
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 5px;
      color: var(--primary-neon);
    }
    
    .stat-trend {
      font-size: 0.8rem;
    }
    
    .stat-trend.up {
      color: #4caf50;
    }
    
    .stat-trend.down {
      color: #f44336;
    }
    
    .stat-trend.neutral {
      color: #ff9800;
    }
    
    .occupancy-timeline {
      margin-top: 20px;
    }
    
    .occupancy-timeline h4 {
      margin-bottom: 10px;
    }
    
    .timeline-chart {
      position: relative;
      height: 100px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .mock-chart {
      display: flex;
      align-items: flex-end;
      height: 100%;
      gap: 4px;
    }
    
    .chart-line {
      flex: 1;
      background: rgba(193, 58, 252, 0.5);
      transition: height 0.5s;
    }
    
    .chart-line.active {
      background: var(--primary-neon);
      box-shadow: 0 0 10px var(--primary-neon);
    }
    
    .chart-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 5px;
      font-size: 0.8rem;
      opacity: 0.8;
    }
    
    /* Notifications */
    .emergency-notification, .voting-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background: rgba(0, 0, 0, 0.9);
      border: 1px solid #ff0000;
      border-radius: 8px;
      box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
      padding: 15px;
      display: flex;
      align-items: flex-start;
      gap: 15px;
      z-index: 2000;
      animation: slideInRight 0.3s ease-out;
    }
    
    .voting-notification {
      border-color: var(--primary-neon);
      box-shadow: 0 0 15px rgba(193, 58, 252, 0.5);
    }
    
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .notification-icon {
      width: 30px;
      height: 30px;
      background: #ff0000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .voting-notification .notification-icon {
      background: var(--primary-neon);
    }
    
    .notification-icon i {
      color: white;
      font-size: 1rem;
    }
    
    .notification-content {
      flex: 1;
    }
    
    .notification-content h4 {
      margin: 0 0 5px 0;
      font-size: 1rem;
    }
    
    .notification-content p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.8;
    }
    
    .notification-close {
      background: none;
      border: none;
      color: white;
      font-size: 1rem;
      cursor: pointer;
      padding: 5px;
      margin-left: auto;
    }
    
    .vote-now-btn {
      background: var(--primary-neon);
      color: black;
      border: none;
      border-radius: 4px;
      padding: 5px 10px;
      margin-top: 10px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s;
    }
    
    .vote-now-btn:hover {
      background: var(--primary-neon-glow);
      box-shadow: 0 0 10px var(--primary-neon);
    }
    
    /* Emergency Status */
    .emergency-status {
      position: fixed;
      bottom: -200px;
      left: 20px;
      right: 20px;
      max-width: 500px;
      margin: 0 auto;
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid #ff0000;
      border-radius: 8px 8px 0 0;
      padding: 15px;
      z-index: 2000;
      transition: all 0.3s ease-in-out;
    }
    
    .emergency-status.active {
      bottom: 0;
    }
    
    .emergency-status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    
    .emergency-status-header h3 {
      margin: 0;
      color: #ff0000;
    }
    
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 15px;
      font-weight: bold;
    }
    
    .status-indicator.pending {
      background: rgba(255, 152, 0, 0.2);
      color: #ff9800;
    }
    
    .status-indicator.accepted {
      background: rgba(76, 175, 80, 0.2);
      color: #4caf50;
    }
    
    .status-indicator.resolved {
      background: rgba(33, 150, 243, 0.2);
      color: #2196f3;
    }
    
    .emergency-details {
      background: rgba(0, 0, 0, 0.5);
      border-radius: 4px;
      padding: 10px;
      margin-bottom: 15px;
    }
    
    .emergency-details p {
      margin: 5px 0;
    }
    
    .emergency-waiting-animation {
      display: flex;
      justify-content: center;
      gap: 5px;
      margin: 15px 0;
    }
    
    .emergency-waiting-animation span {
      display: inline-block;
      width: 10px;
      height: 10px;
      background: #ff0000;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }
    
    .emergency-waiting-animation span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .emergency-waiting-animation span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    .emergency-waiting-animation span:nth-child(4) {
      animation-delay: 0.6s;
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.5);
        opacity: 0.5;
      }
    }
    
    .emergency-instruction {
      text-align: center;
      font-style: italic;
      margin-bottom: 15px;
    }
    
    /* Form Styling für Ankündigungen */
    .form-group {
      margin-bottom: 15px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
    }
    
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 10px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(193, 58, 252, 0.3);
      border-radius: 4px;
      color: white;
    }
    
    .checkbox-group, .radio-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .checkbox-group label, .radio-group label {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 0;
    }
    
    @media (max-width: 768px) {
      .analytics-overlay {
        width: 90%;
        left: 5%;
        right: 5%;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .emergency-status {
        left: 10px;
        right: 10px;
      }
    }
  `;
  
  document.head.appendChild(additionalStyles);