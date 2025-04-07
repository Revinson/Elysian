// map.js - Vollständige Funktionalität für die Event-Karte
console.log("Map JS geladen");

// Dashboard-Integration für die Karte
document.addEventListener('DOMContentLoaded', () => {
  // Token-Check
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Bitte zuerst einloggen!');
    window.location.href = 'login.html';
    return;
  }

  // Prüfe, ob wir von einem bestimmten Ort aus dem Dashboard gekommen sind
  const selectedLocation = localStorage.getItem('selectedLocation');
  if (selectedLocation) {
    // Löschen des Werts aus dem localStorage, damit er beim nächsten Aufruf nicht mehr existiert
    localStorage.removeItem('selectedLocation');
    
    // In einer echten Implementierung: Auf der Karte zum Ort zoomen
    setTimeout(() => {
      console.log(`Zoom zur Location: ${selectedLocation}`);
      alert(`Die Karte würde jetzt zu "${selectedLocation}" zoomen`);
    }, 1000);
  }
  
  // Prüfe, ob wir das Rescue-Modal direkt öffnen sollen
  const openRescue = localStorage.getItem('openRescue');
  if (openRescue === 'true') {
    // Löschen des Werts aus dem localStorage
    localStorage.removeItem('openRescue');
    
    // Rescue-Modal mit Verzögerung öffnen (um sicherzustellen, dass es geladen ist)
    setTimeout(() => {
      const rescueModal = document.getElementById('rescue-modal');
      if (rescueModal) {
        rescueModal.classList.remove('hidden');
      }
    }, 1000);
  }
  
  // "Zurück zum Dashboard"-Button zur Kartenansicht hinzufügen
  const mapHeader = document.querySelector('.map-header');
  if (mapHeader) {
    const backButton = document.createElement('button');
    backButton.className = 'neon-btn back-dashboard-btn';
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Dashboard';
    
    // CSS für den Zurück-Button
    backButton.style.marginRight = '10px';
    
    // Event-Listener für den Zurück-Button
    backButton.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
    
    // Button zur Map-Header hinzufügen (vor allen anderen Elementen)
    const headerRight = mapHeader.querySelector('.header-right');
    if (headerRight) {
      headerRight.insertBefore(backButton, headerRight.firstChild);
    } else {
      // Falls keine .header-right, dann in die .header-left einfügen
      const headerLeft = mapHeader.querySelector('.header-left');
      if (headerLeft) {
        headerLeft.insertAdjacentElement('afterend', backButton);
      } else {
        // Als letztes Mittel am Anfang des Headers hinzufügen
        mapHeader.prepend(backButton);
      }
    }
  }

  // =====================
  // Globale Variablen
  // =====================
  let map = null;                 // Leaflet Map-Instanz
  let userMarker = null;          // Marker für den Nutzer selbst
  let friendMarkers = {};         // Marker für Freunde
  let poiMarkers = [];            // Marker für Points-of-Interest (Dancefloors, Bars, etc.)
  let heatmapLayer = null;        // Heatmap-Layer
  let heatmapInitialized = false; // Flag ob Heatmap initialisiert wurde
  let votingAreas = [];           // Bereiche mit aktivem Voting
  let areaPolygons = {};          // Polygone für Eventbereiche
  let isRescueActive = false;     // Ist ein Notruf aktiv?
  let districtOverlays = {};      // Stadtbezirke Overlays
  
  const MOCK_EVENT_ID = 'event-123'; // Demo-Event-ID
  
  // =====================
  // Initialisierung der Karte
  // =====================
  function initMap() {
    try {
      // Essen statt Berlin
      const defaultLocation = [51.4556, 7.0116]; // Essen (Demo)
      const defaultZoom = 14; // Bisschen weiter raus für Stadtbereich
    
      // Map initialisieren mit dunklem Stil
      map = L.map('event-map', {
        center: defaultLocation,
        zoom: defaultZoom,
        zoomControl: false, // Custom Position für Zoom-Controls
        attributionControl: true,
        preferCanvas: true // Bessere Performance für viele Marker
      });
      
      // Zoom-Controls an besserer Position
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);
      
      // Custom Karten-Stil (dunkel)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 22
      }).addTo(map);
      
      // Nach der Initialisierung Eventdaten laden
      loadEventData(MOCK_EVENT_ID);
      
      // Nutzerposition simulieren (in Echtzeit wäre hier GPS)
      simulateUserPosition(defaultLocation);
      
      // Initialisiere Heatmap (aber noch nicht anzeigen)
      // Mit Verzögerung, damit die Karte Zeit hat, vollständig zu laden
      setTimeout(() => {
        initHeatmap();
      }, 1000);
      
      // Stadtbezirke laden und anzeigen
      loadEssenDistricts();
      
      console.log("Karte erfolgreich initialisiert");
    } catch (error) {
      console.error("Fehler bei der Karteninitialisierung:", error);
    }
  }
  
  // =====================
  // Event-Daten laden
  // =====================
  function loadEventData(eventId) {
    try {
      // In einer echten App würden diese Daten vom Server kommen
      // Für diesen Demo-Code verwenden wir Testdaten
      
      // Demo-Eventdaten für die Warehouse-Party
      const eventData = getMockEventData();
      
      // Event-Bereiche (Räume, Zonen) hinzufügen
      addEventAreas(eventData.areas);
      
      // POIs hinzufügen (Dancefloors, Bars, Safezones)
      addPOIs(eventData.pois);
      
      // Voting-Bereiche hinzufügen
      addVotingAreas(eventData.votingAreas);
      
      // Freunde auf der Karte anzeigen
      updateFriendsOnMap(eventData.friends);
      
      console.log("Event-Daten geladen");
    } catch (error) {
      console.error("Fehler beim Laden der Event-Daten:", error);
    }
  }
  
  // =====================
  // Essen Stadtbezirke laden
  // =====================
  function loadEssenDistricts() {
    try {
      // Daten für die Essener Stadtbezirke (vereinfachte Darstellung)
      const districtsData = [
        {
          id: 'district-1',
          name: 'Stadtbezirk I (Mitte)',
          coordinates: [
            [51.4612, 7.0086],
            [51.4612, 7.0186],
            [51.4512, 7.0186],
            [51.4512, 7.0086]
          ],
          color: '#FF5722',
          fillColor: '#FF5722',
          info: 'Zentrum der Stadt mit Hauptbahnhof und Kulturmeile'
        },
        {
          id: 'district-2',
          name: 'Stadtbezirk II (Rüttenscheid)',
          coordinates: [
            [51.4412, 7.0086],
            [51.4412, 7.0186],
            [51.4312, 7.0186],
            [51.4312, 7.0086]
          ],
          color: '#4CAF50',
          fillColor: '#4CAF50',
          info: 'Bekannt für Restaurants und das Grugapark-Gelände'
        },
        {
          id: 'district-3',
          name: 'Stadtbezirk III (Zollverein)',
          coordinates: [
            [51.4712, 7.0186],
            [51.4712, 7.0286],
            [51.4612, 7.0286],
            [51.4612, 7.0186]
          ],
          color: '#2196F3',
          fillColor: '#2196F3',
          info: 'UNESCO-Welterbe mit der berühmten Zeche Zollverein'
        },
        {
          id: 'district-4',
          name: 'Stadtbezirk IV (Borbeck)',
          coordinates: [
            [51.4712, 6.9986],
            [51.4712, 7.0086],
            [51.4612, 7.0086],
            [51.4612, 6.9986]
          ],
          color: '#9C27B0',
          fillColor: '#9C27B0',
          info: 'Historischer Stadtbezirk mit Schloss Borbeck'
        },
        {
          id: 'district-5',
          name: 'Stadtbezirk V (Altenessen)',
          coordinates: [
            [51.4812, 7.0086],
            [51.4812, 7.0186],
            [51.4712, 7.0186],
            [51.4712, 7.0086]
          ],
          color: '#FFC107',
          fillColor: '#FFC107',
          info: 'Nördlicher Stadtbezirk mit starker Arbeitertradition'
        }
      ];
      
      // Layer-Gruppe für die Bezirke
      const districtsGroup = L.layerGroup();
      
      // Jeden Bezirk zur Karte hinzufügen
      districtsData.forEach(district => {
        const polygon = L.polygon(district.coordinates, {
          color: district.color,
          fillColor: district.fillColor,
          fillOpacity: 0.2,
          weight: 3,
          opacity: 0.8,
          className: 'district-polygon'
        });
        
        // Tooltip mit Bezirksnamen
        polygon.bindTooltip(district.name, {
          permanent: false,
          direction: 'center',
          className: 'district-tooltip'
        });
        
        // Popup mit zusätzlichen Infos
        polygon.bindPopup(`
          <div class="district-popup">
            <h3>${district.name}</h3>
            <p>${district.info}</p>
            <button class="neon-btn district-events-btn" data-district="${district.id}">
              Kulturevents anzeigen
            </button>
          </div>
        `);
        
        // Klick-Event für Popup
        polygon.on('click', (e) => {
          // Verhindere, dass der Klick auf das Polygon zum Schließen des Popups führt
          L.DomEvent.stopPropagation(e);
          
          // Öffne das Popup
          polygon.openPopup();
        });
        
        // Interaktionseffekte
        polygon.on('mouseover', function() {
          this.setStyle({
            fillOpacity: 0.4,
            weight: 4
          });
        });
        
        polygon.on('mouseout', function() {
          this.setStyle({
            fillOpacity: 0.2,
            weight: 3
          });
        });
        
        // Zum Layer und zur Bezirkssammlung hinzufügen
        districtsGroup.addLayer(polygon);
        districtOverlays[district.id] = polygon;
      });
      
      // Layer zur Karte hinzufügen
      districtsGroup.addTo(map);
      
      // Layer-Control für Bezirke zur Karte hinzufügen
      const districtsButton = document.createElement('button');
      districtsButton.id = 'toggle-districts';
      districtsButton.className = 'map-btn active';
      districtsButton.innerHTML = '<i class="fas fa-map"></i> Stadtbezirke';
      
      // Zum Kartenansicht-Filter hinzufügen
      const viewControl = document.querySelector('.control-group:first-child');
      if (viewControl) {
        viewControl.appendChild(districtsButton);
        
        // Event-Listener für den Button
        districtsButton.addEventListener('click', () => {
          districtsButton.classList.toggle('active');
          
          if (districtsButton.classList.contains('active')) {
            districtsGroup.addTo(map);
          } else {
            districtsGroup.remove();
          }
        });
      }
      
      // Listener für District-Events-Buttons in Popups hinzufügen
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('district-events-btn')) {
          const districtId = e.target.getAttribute('data-district');
          showDistrictCulturalEvents(districtId);
        }
      });
      
      console.log("Stadtbezirke geladen");
    } catch (error) {
      console.error("Fehler beim Laden der Stadtbezirke:", error);
    }
  }
  
  // =====================
  // Kulturelle Events im Bezirk anzeigen
  // =====================
  function showDistrictCulturalEvents(districtId) {
    try {
      // Simulierte Kulturdaten für die Demo
      const culturalEvents = {
        'district-1': [
          { name: 'Philharmonie Essen: Klassisches Konzert', date: 'Morgen, 19:30 Uhr', type: 'Musik' },
          { name: 'Museum Folkwang: Moderne Kunst', date: 'Täglich 10-18 Uhr', type: 'Ausstellung' },
          { name: 'Grillo-Theater: Faust', date: 'Freitag, 19:00 Uhr', type: 'Theater' }
        ],
        'district-2': [
          { name: 'Rü-Fest: Straßenfest', date: 'Nächstes Wochenende', type: 'Festival' },
          { name: 'Grugahalle: Rock-Konzert', date: 'Samstag, 20:00 Uhr', type: 'Musik' }
        ],
        'district-3': [
          { name: 'Zollverein: Lichtinstallation', date: 'Täglich ab 18 Uhr', type: 'Kunst' },
          { name: 'Red Dot Design Museum', date: 'Di-So, 11-18 Uhr', type: 'Ausstellung' },
          { name: 'Zollverein: Führung', date: 'Stündlich ab 10 Uhr', type: 'Tour' }
        ],
        'district-4': [
          { name: 'Schloss Borbeck: Klassik-Konzert', date: 'Sonntag, 15:00 Uhr', type: 'Musik' },
          { name: 'Kunstwerkstatt im Schloss', date: 'Samstag, 14-17 Uhr', type: 'Workshop' }
        ],
        'district-5': [
          { name: 'Zeche Carl: Jazz Session', date: 'Donnerstag, 20:00 Uhr', type: 'Musik' },
          { name: 'Altenessen: Stadtteilfest', date: 'Nächstes Wochenende', type: 'Festival' }
        ]
      };
      
      // Overlay für kulturelle Events erstellen oder aktualisieren
      let culturalOverlay = document.getElementById('cultural-events-overlay');
      
      if (!culturalOverlay) {
        culturalOverlay = document.createElement('div');
        culturalOverlay.id = 'cultural-events-overlay';
        culturalOverlay.className = 'map-overlay cultural-overlay';
        
        document.querySelector('.map-container').appendChild(culturalOverlay);
      }
      
      // Bezirksnamen basierend auf ID ermitteln
      const district = document.querySelector(`[data-district="${districtId}"]`).closest('.district-popup').querySelector('h3').textContent;
      
      // Inhalte setzen
      culturalOverlay.innerHTML = `
        <div class="overlay-header">
          <h3><i class="fas fa-theater-masks"></i> Kulturevents in ${district}</h3>
          <button id="close-cultural-overlay" class="close-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="overlay-content">
          <div class="cultural-events-list">
            ${culturalEvents[districtId].map(event => `
              <div class="cultural-event-item">
                <div class="event-type-icon">
                  <i class="fas ${event.type === 'Musik' ? 'fa-music' : 
                                event.type === 'Ausstellung' ? 'fa-palette' :
                                event.type === 'Theater' ? 'fa-theater-masks' :
                                event.type === 'Festival' ? 'fa-users' :
                                event.type === 'Tour' ? 'fa-walking' :
                                event.type === 'Workshop' ? 'fa-hands' : 'fa-calendar-alt'}"></i>
                </div>
                <div class="event-details">
                  <div class="event-name">${event.name}</div>
                  <div class="event-date">${event.date}</div>
                  <div class="event-type">${event.type}</div>
                </div>
                <button class="event-action-btn"><i class="fas fa-star"></i></button>
              </div>
            `).join('')}
          </div>
          <div class="cultural-overlay-actions">
            <button id="show-all-events" class="neon-btn"><i class="fas fa-list"></i> Alle Events anzeigen</button>
            <button id="filter-events" class="neon-btn"><i class="fas fa-filter"></i> Nach Typ filtern</button>
          </div>
          <div class="kulturamt-info">
            <div class="kulturamt-logo">
              <i class="fas fa-landmark"></i>
            </div>
            <div class="kulturamt-text">
              Daten bereitgestellt vom Kulturamt Essen
            </div>
          </div>
        </div>
      `;
      
      // Overlay anzeigen
      culturalOverlay.classList.remove('hidden');
      
      // Schließen-Button
      document.getElementById('close-cultural-overlay').addEventListener('click', () => {
        culturalOverlay.classList.add('hidden');
      });
      
      // Weitere Button-Handler
      document.getElementById('show-all-events').addEventListener('click', () => {
        alert('In der vollständigen App: Weiterleitung zur kompletten Event-Liste');
      });
      
      document.getElementById('filter-events').addEventListener('click', () => {
        alert('In der vollständigen App: Event-Filteroptionen öffnen');
      });
      
      // Event-Aktion-Buttons
      document.querySelectorAll('.event-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const eventName = e.target.closest('.cultural-event-item').querySelector('.event-name').textContent;
          btn.innerHTML = '<i class="fas fa-check"></i>';
          alert(`Event "${eventName}" zu deinen Favoriten hinzugefügt!`);
        });
      });
    } catch (error) {
      console.error("Fehler beim Anzeigen der kulturellen Events:", error);
    }
  }
  
  // =====================
  // Nutzerposition simulieren (in einer echten App: GPS)
  // =====================
  function simulateUserPosition(initialPosition) {
    try {
      // Erstelle einen Marker für den Nutzer
      const userIcon = L.divIcon({
        className: 'custom-marker user-marker',
        html: '<i class="fas fa-user" style="font-size: 24px; color: #00ffff; text-shadow: 0 0 5px #00ffff;"></i>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      
      userMarker = L.marker(initialPosition, {
        icon: userIcon,
        zIndexOffset: 1000
      }).addTo(map);
      
      // Simuliere kleine Bewegungen (in einer echten App: GPS-Updates)
      let lastPos = initialPosition;
      setInterval(() => {
        try {
          // Kleine zufällige Bewegung
          const newLat = lastPos[0] + (Math.random() - 0.5) * 0.0003;
          const newLng = lastPos[1] + (Math.random() - 0.5) * 0.0003;
          lastPos = [newLat, newLng];
          
          // Marker aktualisieren mit Animation
          userMarker.setLatLng(lastPos);
          
          // Wenn aktiviert: Karte dem Nutzer folgen lassen
          // map.panTo(lastPos);
          
          // Heatmap-Daten nur aktualisieren, wenn Heatmap initialisiert und sichtbar ist
          if (heatmapInitialized && document.getElementById('toggle-heatmap').classList.contains('active')) {
            refreshHeatmap();
          }
        } catch (error) {
          console.warn("Fehler bei der Nutzerpositionsaktualisierung:", error);
        }
      }, 3000);
    } catch (error) {
      console.error("Fehler bei der Nutzerpositionssimulation:", error);
    }
  }
  
  // =====================
  // Event-Bereiche zur Karte hinzufügen
  // =====================
  function addEventAreas(areas) {
    try {
      // Jeder Bereich bekommt ein Polygon auf der Karte
      areas.forEach(area => {
        const polygon = L.polygon(area.coordinates, {
          color: area.color || '#c13afc',
          fillColor: area.fillColor || '#c13afc',
          fillOpacity: 0.1,
          weight: 2
        }).addTo(map);
        
        // Popup mit Bereichsinfo hinzufügen
        polygon.bindTooltip(area.name);
        
        // Klick-Handler für Bereichsdetails
        polygon.on('click', () => {
          showAreaDetails(area);
        });
        
        // Speichern für späteren Zugriff
        areaPolygons[area.id] = polygon;
      });
    } catch (error) {
      console.error("Fehler beim Hinzufügen von Event-Bereichen:", error);
    }
  }
  
  // =====================
  // POIs auf der Karte anzeigen (Dancefloors, Bars, etc.)
  // =====================
  function addPOIs(pois) {
    try {
      pois.forEach(poi => {
        // Icon je nach POI-Typ
        let iconHtml, className;
        
        switch(poi.type) {
          case 'dancefloor':
            iconHtml = '<i class="fas fa-music" style="font-size: 20px;"></i>';
            className = 'custom-marker marker-dancefloor';
            break;
          case 'bar':
            iconHtml = '<i class="fas fa-glass-martini-alt" style="font-size: 20px;"></i>';
            className = 'custom-marker marker-bar';
            break;
          case 'safezone':
            iconHtml = '<i class="fas fa-shield-alt" style="font-size: 20px;"></i>';
            className = 'custom-marker marker-safezone';
            break;
          case 'cultural':
            iconHtml = '<i class="fas fa-theater-masks" style="font-size: 20px;"></i>';
            className = 'custom-marker marker-cultural';
            break;
          default:
            iconHtml = '<i class="fas fa-map-marker-alt" style="font-size: 20px;"></i>';
            className = 'custom-marker';
        }
        
        const icon = L.divIcon({
          className: className,
          html: iconHtml,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
        
        // Marker erstellen und zur Karte hinzufügen
        const marker = L.marker(poi.coordinates, {
          icon: icon
        }).addTo(map);
        
        // Tooltip mit Namen
        marker.bindTooltip(poi.name);
        
        // Klick-Handler für Details
        marker.on('click', () => {
          showPOIDetails(poi);
        });
        
        // Speichern für Filterung später
        marker.poiType = poi.type;
        marker.poiId = poi.id;
        poiMarkers.push(marker);
      });
    } catch (error) {
      console.error("Fehler beim Hinzufügen von POIs:", error);
    }
  }
  
  // =====================
  // POI-Details anzeigen
  // =====================
  function showPOIDetails(poi) {
    try {
      const overlay = document.getElementById('selected-item-info');
      const titleEl = document.getElementById('selected-title');
      const detailsEl = document.getElementById('selected-details');
      const actionsEl = document.getElementById('selected-actions');
      
      // Titel und Typ
      titleEl.textContent = poi.name;
      
      // Details basierend auf POI-Typ
      let detailsHTML = '';
      
      switch(poi.type) {
        case 'dancefloor':
          detailsHTML = `
            <div class="info-row"><span>DJ:</span> <strong>${poi.currentDJ || 'TBA'}</strong></div>
            <div class="info-row"><span>Genre:</span> ${poi.genre || 'Mixed'}</div>
            <div class="info-row"><span>Kapazität:</span> ${poi.capacity || '???'}</div>
            <div class="info-row"><span>Aktuelle Auslastung:</span> <div class="progress-bar">
              <div class="progress-fill" style="width: ${poi.currentLoad || 0}%;"></div>
            </div></div>
          `;
          
          if (poi.voteActive) {
            actionsEl.innerHTML = `
              <button id="show-vote-btn" class="neon-btn"><i class="fas fa-poll"></i> Am Voting teilnehmen</button>
            `;
            
            document.getElementById('show-vote-btn').addEventListener('click', () => {
              showVotingOverlay(poi.id);
            });
          } else {
            actionsEl.innerHTML = '';
          }
          break;
          
        case 'bar':
          detailsHTML = `
            <div class="info-row"><span>Getränke:</span> ${poi.drinks?.join(', ') || 'Standardauswahl'}</div>
            <div class="info-row"><span>Aktuelle Wartezeit:</span> ${poi.waitTime || 'keine Angabe'}</div>
            <div class="info-row"><span>Besonderheiten:</span> ${poi.special || '-'}</div>
          `;
          actionsEl.innerHTML = '';
          break;
          
        case 'safezone':
          detailsHTML = `
            <div class="info-row"><span>Typ:</span> ${poi.safeType || 'Ruhebereich'}</div>
            <div class="info-row"><span>Ausstattung:</span> ${poi.features?.join(', ') || '-'}</div>
            <div class="info-row"><span>Besetzt:</span> ${poi.occupied ? 'Ja' : 'Nein'}</div>
          `;
          actionsEl.innerHTML = `
            <button id="navigate-safezone" class="neon-btn"><i class="fas fa-route"></i> Route anzeigen</button>
          `;
          
          document.getElementById('navigate-safezone').addEventListener('click', () => {
            navigateTo(poi.coordinates);
          });
          break;
          
        case 'cultural':
          detailsHTML = `
            <div class="info-row"><span>Typ:</span> <strong>${poi.eventType || 'Kulturveranstaltung'}</strong></div>
            <div class="info-row"><span>Beschreibung:</span> ${poi.description || '-'}</div>
            <div class="info-row"><span>Eintritt:</span> ${poi.fee || 'Frei'}</div>
            <div class="info-row"><span>Zeit:</span> ${poi.time || 'Ganztägig'}</div>
          `;
          actionsEl.innerHTML = `
            <button id="cultural-info-btn" class="neon-btn"><i class="fas fa-info-circle"></i> Mehr Details</button>
            <button id="navigate-cultural" class="neon-btn"><i class="fas fa-route"></i> Route anzeigen</button>
          `;
          
          document.getElementById('navigate-cultural').addEventListener('click', () => {
            navigateTo(poi.coordinates);
          });
          
          document.getElementById('cultural-info-btn').addEventListener('click', () => {
            // Kulturamt-URL öffnen oder weitere Details anzeigen
            alert(`In der vollständigen App: Detailseite zu "${poi.name}" öffnen`);
          });
          break;
          
        default:
          detailsHTML = `
            <div class="info-row"><span>Typ:</span> ${poi.type}</div>
            <div class="info-row"><span>Beschreibung:</span> ${poi.description || '-'}</div>
          `;
          actionsEl.innerHTML = '';
      }
      
      detailsEl.innerHTML = detailsHTML;
      
      // Overlay anzeigen
      overlay.classList.remove('hidden');
      
      // Schließen-Button
      document.getElementById('close-overlay').addEventListener('click', () => {
        overlay.classList.add('hidden');
      });
    } catch (error) {
      console.error("Fehler beim Anzeigen der POI-Details:", error);
    }
  }
  
  // =====================
  // Area-Details anzeigen
  // =====================
  function showAreaDetails(area) {
    try {
      const overlay = document.getElementById('selected-item-info');
      const titleEl = document.getElementById('selected-title');
      const detailsEl = document.getElementById('selected-details');
      const actionsEl = document.getElementById('selected-actions');
      
      // Titel und Typ
      titleEl.textContent = area.name;
      
      // Details für Bereich
      const detailsHTML = `
        <div class="info-row"><span>Typ:</span> ${area.type || 'Raum'}</div>
        <div class="info-row"><span>Kapazität:</span> ${area.capacity || '???'}</div>
        <div class="info-row"><span>Beschreibung:</span> ${area.description || '-'}</div>
        <div class="info-row"><span>Aktuelle Besucherzahl:</span> ca. ${area.currentVisitors || '???'}</div>
      `;
      
      detailsEl.innerHTML = detailsHTML;
      
      // Aktionen
      actionsEl.innerHTML = `
        <button id="center-area-btn" class="neon-btn"><i class="fas fa-crosshairs"></i> Auf Karte zentrieren</button>
      `;
      
      document.getElementById('center-area-btn').addEventListener('click', () => {
        // Berechne den Mittelpunkt des Polygons und zentriere darauf
        const polygon = areaPolygons[area.id];
        if (polygon) {
          const bounds = polygon.getBounds();
          map.fitBounds(bounds);
        }
      });
      
      // Overlay anzeigen
      overlay.classList.remove('hidden');
      
      // Schließen-Button
      document.getElementById('close-overlay').addEventListener('click', () => {
        overlay.classList.add('hidden');
      });
    } catch (error) {
      console.error("Fehler beim Anzeigen der Area-Details:", error);
    }
  }
  
  // =====================
  // Verbesserte Heatmap-Funktionen
  // =====================
  
  /**
   * Initialisiert die Heatmap mit Verzögerung
   */
  function initHeatmap() {
    try {
      console.log("Heatmap-Initialisierung gestartet...");
      
      // Dummy-Daten - wichtig für korrekte Initialisierung
      const dummyData = [
        [51.4556, 7.0116, 0.5]  // Ein einzelner Punkt zum Starten
      ];
      
      // Erstelle den Heatmap-Layer
      heatmapLayer = L.heatLayer(dummyData, {
        radius: 20,
        blur: 15,
        maxZoom: 20,
        max: 1.0,
        gradient: {
          0.0: 'blue',
          0.5: 'lime',
          0.8: 'yellow',
          1.0: 'red'
        }
      });
      
      // Füge Layer zur Karte hinzu
      heatmapLayer.addTo(map);
      
      // Standardmäßig ausblenden
      toggleHeatmap(false);
      
      // Flag setzen
      heatmapInitialized = true;
      console.log("Heatmap erfolgreich initialisiert");
    } catch (error) {
      console.error("Fehler bei der Heatmap-Initialisierung:", error);
    }
  }
  
  /**
   * Heatmap ein-/ausblenden
   */
  /**
 * Heatmap ein-/ausblenden - korrigierte Version
 */
function toggleHeatmap(show) {
  try {
    if (!heatmapLayer || !heatmapInitialized) {
      console.log("Heatmap noch nicht initialisiert");
      return;
    }
    
    if (show) {
      // Sicherstellen, dass der Layer der Karte hinzugefügt wurde
      if (!map.hasLayer(heatmapLayer)) {
        map.addLayer(heatmapLayer);
      }
      
      // Daten aktualisieren
      refreshHeatmap();
    } else {
      // Layer von der Karte entfernen
      if (map.hasLayer(heatmapLayer)) {
        map.removeLayer(heatmapLayer);
      }
    }
  } catch (error) {
    console.error("Fehler beim Umschalten der Heatmap:", error);
  }
}
  
  /**
   * Aktualisiert die Heatmap nur, wenn sie initialisiert und sichtbar ist
   */
  function refreshHeatmap() {
    try {
      if (!heatmapLayer || !heatmapInitialized || !map.hasLayer(heatmapLayer)) {
        // Heatmap ist nicht bereit oder nicht sichtbar
        return;
      }
      
      const points = generateHeatmapData();
      
      if (points.length > 0) {
        // Daten aktualisieren
        heatmapLayer.setLatLngs(points);
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Heatmap:", error);
    }
  }
  
  /**
   * Generiert Heatmap-Datenpunkte basierend auf Nutzern und simulierten Daten
   */
  function generateHeatmapData() {
    const points = [];
    
    // Nutzerposition
    if (userMarker) {
      const pos = userMarker.getLatLng();
      points.push([pos.lat, pos.lng, 0.5]); // Eigene Position hat mittlere Intensität
    }
    
    // Freundespositionen
    if (typeof friendMarkers !== 'undefined') {
      Object.values(friendMarkers).forEach(marker => {
        if (marker.isOnline) {
          const pos = marker.getLatLng();
          points.push([pos.lat, pos.lng, 0.3]); // Freunde haben niedrigere Intensität
        }
      });
    }
    
    // Zufällige simulierte Nutzer hinzufügen (für Demo)
    if (userMarker) {
      const basePos = userMarker.getLatLng();
      
      // 20 zufällige Punkte um den Nutzer herum (reduzierte Anzahl für bessere Performance)
      for (let i = 0; i < 20; i++) {
        const lat = basePos.lat + (Math.random() - 0.5) * 0.003;
        const lng = basePos.lng + (Math.random() - 0.5) * 0.003;
        const intensity = Math.random() * 0.7 + 0.1; // 0.1 - 0.8
        
        points.push([lat, lng, intensity]);
      }
    }
    
    return points;
  }
  
  // Alte Funktion als Wrapper für Abwärtskompatibilität
  function updateHeatmapBasedOnUsers() {
    if (heatmapInitialized) {
      refreshHeatmap();
    }
  }
  
  // =====================
  // Voting-Bereiche hinzufügen
  // =====================
  function addVotingAreas(areas) {
    try {
      areas.forEach(area => {
        // Erstelle einen speziellen Marker für den Voting-Bereich
        const icon = L.divIcon({
          className: 'custom-marker marker-voting',
          html: '<i class="fas fa-poll" style="font-size: 24px; color: #FFA500; text-shadow: 0 0 8px #FFA500;"></i>',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
        
        const marker = L.marker(area.coordinates, {
          icon: icon
        }).addTo(map);
        
        // Tooltip mit Namen
        marker.bindTooltip(`${area.name} - Live-Voting aktiv!`);
        
        // Animation für Aufmerksamkeit
        function pulseMarker() {
          const icon = marker.getElement();
          if (icon) {
            icon.style.transform = 'scale(1.2)';
            setTimeout(() => {
              icon.style.transform = 'scale(1)';
            }, 500);
          }
        }
        
        // Pulsieren alle 3 Sekunden
        const pulseInterval = setInterval(pulseMarker, 3000);
        
        // Klick-Handler für Voting-Overlay
        marker.on('click', () => {
          showVotingOverlay(area.id);
        });
        
        // Speichern für späteren Zugriff
        votingAreas.push({
          id: area.id,
          marker: marker,
          data: area,
          pulseInterval: pulseInterval
        });
      });
    } catch (error) {
      console.error("Fehler beim Hinzufügen von Voting-Bereichen:", error);
    }
  }
  
  // =====================
  // Voting-Overlay anzeigen
  // =====================
  function showVotingOverlay(areaId) {
    try {
      const votingArea = votingAreas.find(area => area.id === areaId);
      
      if (!votingArea) return;
      
      const overlay = document.getElementById('voting-overlay');
      const content = overlay.querySelector('.overlay-content');
      
      // Voting-ID im Overlay speichern für Updates
      overlay.setAttribute('data-voting-id', areaId);
      
      // Voting-Optionen einfügen (in einer echten App vom Server)
      content.querySelector('.voting-options').innerHTML = votingArea.data.options.map(option => `
        <div class="vote-option">
          <div class="vote-progress" style="width: ${option.percentage}%"></div>
          <div class="vote-label">${option.name}</div>
          <div class="vote-count">${option.percentage}%</div>
          <button class="vote-btn neon-btn" data-id="${option.id}">Vote</button>
        </div>
      `).join('');
      
      // Timer aktualisieren
      document.getElementById('voting-timer').textContent = votingArea.data.timeLeft;
      
      // Vote-Button Handler
      content.querySelectorAll('.vote-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const optionId = e.target.getAttribute('data-id');
          submitVote(areaId, optionId);
        });
      });
      
      // Overlay anzeigen
      overlay.classList.remove('hidden');
      
      // Schließen-Button
      document.getElementById('close-voting').addEventListener('click', () => {
        overlay.classList.add('hidden');
      });
    } catch (error) {
      console.error("Fehler beim Anzeigen des Voting-Overlays:", error);
    }
  }
  
  // =====================
  // Stimme abgeben
  // =====================
  function submitVote(areaId, optionId) {
    try {
      // In einer echten App: API-Call zum Server
      console.log(`Vote abgegeben: Bereich ${areaId}, Option ${optionId}`);
      
      // Bestätigungsfeedback
      alert('Deine Stimme wurde gezählt! In der echten App würde das Ergebnis in Echtzeit aktualisiert.');
      
      // Overlay schließen
      document.getElementById('voting-overlay').classList.add('hidden');
    } catch (error) {
      console.error("Fehler beim Abstimmen:", error);
    }
  }
  
  // =====================
  // Freunde auf der Karte anzeigen
  // =====================
  function updateFriendsOnMap(friends) {
    try {
      // Bestehende Marker entfernen
      Object.values(friendMarkers).forEach(marker => {
        if (map.hasLayer(marker)) {
          map.removeLayer(marker);
        }
      });
      
      friendMarkers = {};
      
      // Neue Marker für jeden Freund erstellen
      friends.forEach(friend => {
        if (!friend.online) return; // Nur online-Freunde anzeigen
        
        // Icon je nach Status
        const icon = L.divIcon({
          className: 'custom-marker marker-friend',
          html: `<i class="fas fa-user-friends" style="font-size: 20px; ${friend.online ? 'color: #ffff00; text-shadow: 0 0 5px #ffff00;' : 'color: #aaa; opacity: 0.6;'}"></i>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        
        // Marker erstellen
        const marker = L.marker(friend.coordinates, {
          icon: icon
        });
        
        // Tooltip mit Namen
        marker.bindTooltip(friend.name);
        
        // Zusatzinfo speichern
        marker.friendId = friend.id;
        marker.isOnline = friend.online;
        
        // Speichern für späteren Zugriff
        friendMarkers[friend.id] = marker;
      });
      
      // Wenn Freunde-Filter aktiv ist, Marker zur Karte hinzufügen
      if (document.getElementById('toggle-friends').classList.contains('active')) {
        showFriendsOnMap(true);
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Freunde auf der Karte:", error);
    }
  }
  
  // =====================
  // Freunde auf der Karte ein-/ausblenden
  // =====================
  function showFriendsOnMap(show) {
    try {
      Object.values(friendMarkers).forEach(marker => {
        if (show) {
          map.addLayer(marker);
        } else if (map.hasLayer(marker)) {
          map.removeLayer(marker);
        }
      });
    } catch (error) {
      console.error("Fehler beim Ein-/Ausblenden der Freunde:", error);
    }
  }
  
  // =====================
  // Navigation zu einem Punkt auf der Karte
  // =====================
  function navigateTo(coordinates) {
    try {
      if (!userMarker || !coordinates) return;
      
      // Zoom auf beide Punkte (Nutzer und Ziel)
      const userPos = userMarker.getLatLng();
      const bounds = L.latLngBounds([userPos], [coordinates]);
      
      map.fitBounds(bounds, {
        padding: [50, 50]
      });
      
      // In einer echten App: Route berechnen und anzeigen
      // Hier: Einfache direkte Linie
      const routeLine = L.polyline([
        [userPos.lat, userPos.lng],
        coordinates
      ], {
        color: '#c13afc',
        weight: 3,
        opacity: 0.8,
        dashArray: '10, 10',
        lineCap: 'round'
      }).addTo(map);
      
      // Linie nach 10 Sekunden entfernen
      setTimeout(() => {
        if (map.hasLayer(routeLine)) {
          map.removeLayer(routeLine);
        }
      }, 10000);
      
      // Erfolgsmeldung
      alert('Route wird angezeigt. In einer echten App würde eine Navigationsanleitung folgen.');
    } catch (error) {
      console.error("Fehler bei der Navigation:", error);
    }
  }
  
  // =====================
  // Mock-Daten für die Demonstration
  // =====================
  function getMockEventData() {
    return {
      id: MOCK_EVENT_ID,
      name: "Techno Friday @ Colosseum Theater Essen",
      areas: [
        {
          id: 'main-hall',
          name: 'Hauptsaal',
          type: 'Dancefloor',
          coordinates: [
            [51.4556, 7.0110],
            [51.4556, 7.0120],
            [51.4551, 7.0120],
            [51.4551, 7.0110]
          ],
          color: '#FF00FF',
          fillColor: '#FF00FF',
          capacity: 500,
          currentVisitors: 320,
          description: 'Haupttanzfläche mit großer Soundanlage'
        },
        {
          id: 'second-floor',
          name: 'Obergeschoss',
          type: 'Dancefloor',
          coordinates: [
            [51.4561, 7.0110],
            [51.4561, 7.0120],
            [51.4556, 7.0120],
            [51.4556, 7.0110]
          ],
          color: '#00FFFF',
          fillColor: '#00FFFF',
          capacity: 300,
          currentVisitors: 180,
          description: 'Experimentelle Musik und Deep Techno'
        },
        {
          id: 'chill-out',
          name: 'Chill-Out Bereich',
          type: 'Ruhezone',
          coordinates: [
            [51.4551, 7.0120],
            [51.4551, 7.0130],
            [51.4546, 7.0130],
            [51.4546, 7.0120]
          ],
          color: '#00FF00',
          fillColor: '#00FF00',
          capacity: 100,
          currentVisitors: 40,
          description: 'Ruhiger Bereich zum Entspannen'
        }
      ],
      pois: [
        {
          id: 'main-dj',
          name: 'Main DJ Booth',
          type: 'dancefloor',
          coordinates: [51.4554, 7.0118],
          currentDJ: 'DJ Pulsar',
          genre: 'Hard Techno',
          capacity: 500,
          currentLoad: 75,
          voteActive: true
        },
        {
          id: 'second-dj',
          name: 'Second Floor DJ',
          type: 'dancefloor',
          coordinates: [51.4560, 7.0117],
          currentDJ: 'Amelia Dreams',
          genre: 'Melodic Techno',
          capacity: 300,
          currentLoad: 60,
          voteActive: false
        },
        {
          id: 'main-bar',
          name: 'Hauptbar',
          type: 'bar',
          coordinates: [51.4553, 7.0112],
          drinks: ['Bier', 'Wein', 'Cocktails', 'Shots', 'Alkoholfrei'],
          waitTime: '~5 Minuten',
          special: 'Happy Hour 22-23 Uhr'
        },
        {
          id: 'second-bar',
          name: 'Second Floor Bar',
          type: 'bar',
          coordinates: [51.4558, 7.0112],
          drinks: ['Bier', 'Shots', 'Energy-Drinks'],
          waitTime: '~3 Minuten'
        },
        {
          id: 'main-safezone',
          name: 'Awareness-Team & Erste Hilfe',
          type: 'safezone',
          coordinates: [51.4549, 7.0124],
          safeType: 'Erste Hilfe & Awareness',
          features: ['Wasser', 'Ruhebereiche', 'Medizinische Hilfe'],
          occupied: false
        },
        {
          id: 'chill-safezone',
          name: 'Chill-Out Zone',
          type: 'safezone',
          coordinates: [51.4548, 7.0122],
          safeType: 'Ruhebereich',
          features: ['Sitzmöglichkeiten', 'Wasser', 'Leise Musik'],
          occupied: true
        },
        // Neue kulturelle POIs für die verbesserte Version
        {
          id: 'museum-folkwang',
          name: 'Museum Folkwang',
          type: 'cultural',
          coordinates: [51.4412, 7.0086],
          eventType: 'Ausstellung',
          description: 'Moderne Kunst und zeitgenössische Ausstellungen',
          fee: '8€, ermäßigt 4€',
          time: '10:00 - 18:00 Uhr'
        },
        {
          id: 'philharmonie',
          name: 'Philharmonie Essen',
          type: 'cultural',
          coordinates: [51.4413, 7.0096],
          eventType: 'Konzert',
          description: 'Klassische Konzerte und Aufführungen',
          fee: '25-45€',
          time: '19:30 Uhr'
        },
        {
          id: 'zollverein',
          name: 'Zeche Zollverein',
          type: 'cultural',
          coordinates: [51.4712, 7.0290],
          eventType: 'UNESCO-Welterbe',
          description: 'Industriekultur und Kunstinstallationen',
          fee: '6€, ermäßigt 3€',
          time: '10:00 - 18:00 Uhr'
        }
      ],
      heatmapData: [
        // Wird dynamisch generiert
      ],
      votingAreas: [
        {
          id: 'voting-main',
          name: 'DJ Voting (Main)',
          coordinates: [51.4554, 7.0114],
          timeLeft: '2:45',
          options: [
            { id: 'opt1', name: 'Hard Techno', percentage: 75 },
            { id: 'opt2', name: 'Melodic Techno', percentage: 15 },
            { id: 'opt3', name: 'Tech House', percentage: 10 }
          ]
        }
      ],
      friends: [
        {
          id: 'friend-1',
          name: 'TechnoTim',
          online: true,
          coordinates: [51.4552, 7.0116]
        },
        {
          id: 'friend-2',
          name: 'BassQueen',
          online: true,
          coordinates: [51.4553, 7.0111]
        },
        {
          id: 'friend-3',
          name: 'NeonDancer',
          online: false,
          coordinates: null
        }
      ]
    };
  }
  
  // =====================
  // UI-Event-Handler
  // =====================
  
  // Header-Navigation
  document.getElementById('forum-btn').addEventListener('click', () => {
    window.location.href = 'forum.html';
  });
  
  document.getElementById('dashboard-btn').addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
  
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
  
  // Kartenansicht-Filter
  document.getElementById('view-all').addEventListener('click', () => {
    toggleViewFilter('all');
  });
  
  document.getElementById('view-dancefloors').addEventListener('click', () => {
    toggleViewFilter('dancefloor');
  });
  
  document.getElementById('view-bars').addEventListener('click', () => {
    toggleViewFilter('bar');
  });
  
  document.getElementById('view-safezones').addEventListener('click', () => {
    toggleViewFilter('safezone');
  });
  
  function toggleViewFilter(type) {
    try {
      // UI-Buttons aktualisieren
      document.querySelectorAll('.control-group:first-child .map-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      if (type === 'all') {
        document.getElementById('view-all').classList.add('active');
      } else {
        document.getElementById(`view-${type}s`).classList.add('active');
      }
      
      // Marker filtern
      poiMarkers.forEach(marker => {
        if (type === 'all' || marker.poiType === type) {
          // Marker anzeigen
          map.addLayer(marker);
        } else if (map.hasLayer(marker)) {
          // Marker ausblenden
          map.removeLayer(marker);
        }
      });
    } catch (error) {
      console.error("Fehler beim Umschalten der Kartenansicht:", error);
    }
  }
  
  // Live-Data-Filter
  document.getElementById('toggle-heatmap').addEventListener('click', () => {
    const btn = document.getElementById('toggle-heatmap');
    const isActive = btn.classList.toggle('active');
    toggleHeatmap(isActive);
  });
  
  document.getElementById('toggle-friends').addEventListener('click', () => {
    const btn = document.getElementById('toggle-friends');
    const isActive = btn.classList.toggle('active');
    showFriendsOnMap(isActive);
  });
  
  document.getElementById('toggle-voting').addEventListener('click', () => {
    const btn = document.getElementById('toggle-voting');
    const isActive = btn.classList.toggle('active');
    
    // Voting-Bereiche ein-/ausblenden
    votingAreas.forEach(area => {
      if (isActive) {
        map.addLayer(area.marker);
      } else if (map.hasLayer(area.marker)) {
        map.removeLayer(area.marker);
      }
    });
  });
  
  // Friend Location Buttons
  document.querySelectorAll('.friend-locate-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      try {
        const friendItem = e.target.closest('.friend-item');
        if (friendItem && !friendItem.classList.contains('offline')) {
          const friendName = friendItem.querySelector('.friend-name').textContent;
          
          // In einer echten App: Freundes-ID nutzen
          // Hier: Namen zum Aufinden im Mock-Array
          const friend = getMockEventData().friends.find(f => f.name === friendName);
          
          if (friend && friend.coordinates) {
            // Karte auf Freund zentrieren
            map.setView(friend.coordinates, 19);
            
            // Feedback
            alert(`Karte auf ${friendName} zentriert.`);
          }
        }
      } catch (error) {
        console.error("Fehler beim Lokalisieren eines Freundes:", error);
      }
    });
  });
  
  // Rescue-Button
  document.getElementById('rescue-btn').addEventListener('click', () => {
    // Rescue-Modal anzeigen
    document.getElementById('rescue-modal').classList.remove('hidden');
  });
  
  // Rescue-Modal schließen
  document.getElementById('close-rescue-modal').addEventListener('click', () => {
    document.getElementById('rescue-modal').classList.add('hidden');
  });
  
  // Rescue-Option auswählen
  document.querySelectorAll('.rescue-option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Alle deaktivieren
      document.querySelectorAll('.rescue-option-btn').forEach(b => {
        b.classList.remove('selected');
      });
      
      // Ausgewählte aktivieren
      e.currentTarget.classList.add('selected');
    });
  });
  
  // Rescue-Anfrage senden
  document.getElementById('send-rescue').addEventListener('click', () => {
    try {
      const selectedOption = document.querySelector('.rescue-option-btn.selected');
      
      if (!selectedOption) {
        alert('Bitte wähle eine Option aus.');
        return;
      }
      
      const rescueType = selectedOption.getAttribute('data-type');
      const message = document.getElementById('rescue-message').value.trim();
      
      // In einer echten App: API-Call zum Server
      console.log(`Rettungsanfrage: Typ ${rescueType}, Nachricht: ${message}`);
      
      // Feedback
      alert(`Deine Anfrage wurde gesendet. In einer echten App würde dir nun mitgeteilt werden, wie lange es dauert, bis Hilfe da ist.`);
      
      // Modal schließen
      document.getElementById('rescue-modal').classList.add('hidden');
      
      // Flag setzen
      isRescueActive = true;
      
      // In einer echten App: Status-Updates und Tracking
    } catch (error) {
      console.error("Fehler beim Senden einer Rettungsanfrage:", error);
    }
  });
  
  // Kultur-POI-Filter hinzufügen
  const viewControl = document.querySelector('.control-group:first-child');
  if (viewControl) {
    const culturalButton = document.createElement('button');
    culturalButton.id = 'view-cultural';
    culturalButton.className = 'map-btn';
    culturalButton.innerHTML = '<i class="fas fa-theater-masks"></i> Kulturelles';
    
    viewControl.appendChild(culturalButton);
    
    // Event-Listener für kulturelle POIs
    culturalButton.addEventListener('click', () => {
      toggleViewFilter('cultural');
    });
  }
  
  // =====================
  // Karte initialisieren
  // =====================
  initMap();
});