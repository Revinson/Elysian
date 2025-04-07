/**
 * live-pulse.js
 * Skript für die visuelle Darstellung von aktiven Elementen auf der Karte
 */

class LivePulseManager {
    constructor(map) {
      this.map = map;
      this.pulseElements = new Map(); // Map zur Speicherung von Elementen und ihren Puls-Effekten
      this.pulseInterval = null;
      this.currentZoom = map.getZoom();
      
      // Event-Listener für Zoom-Änderungen
      map.on('zoom', () => {
        this.currentZoom = map.getZoom();
        this.adjustPulseSize();
      });
    }
    
    /**
     * Startet die Puls-Animation für alle Elemente
     */
    startPulseAnimation() {
      if (this.pulseInterval) return;
      
      this.pulseInterval = setInterval(() => {
        this.updatePulseEffects();
      }, 50); // Aktualisierung alle 50ms für flüssige Animation
    }
    
    /**
     * Stoppt die Puls-Animation
     */
    stopPulseAnimation() {
      if (this.pulseInterval) {
        clearInterval(this.pulseInterval);
        this.pulseInterval = null;
      }
    }
    
    /**
     * Fügt ein neues Element mit Puls-Effekt hinzu
     * @param {string} id - Eindeutige ID des Elements
     * @param {object} element - Das Leaflet-Element (Marker, Circle, etc.)
     * @param {object} options - Optionen für den Puls-Effekt
     */
    addPulseElement(id, element, options = {}) {
      const defaultOptions = {
        color: '#ff3860',      // Farbe des Puls-Effekts
        fillColor: '#ff3860',  // Füllfarbe des Puls-Effekts
        intensity: 1.0,        // Intensität des Puls-Effekts (0.0 - 1.0)
        radius: 30,            // Radius des Puls-Effekts in Metern
        duration: 1.5,         // Dauer eines Pulses in Sekunden
        fadeOut: true,         // Verblassen des Pulses
        persistent: false,     // Dauerhafter Puls (true) oder einmaliger Puls (false)
        pulseType: 'circle',   // Typ des Pulses: 'circle', 'marker', 'polygon'
        maxRadius: 100         // Maximaler Radius des Pulses in Metern
      };
      
      const mergedOptions = { ...defaultOptions, ...options };
      
      let pulseElement;
      let coordinates;
      
      // Je nach Element-Typ die Koordinaten extrahieren
      if (element instanceof L.Marker) {
        coordinates = element.getLatLng();
      } else if (element instanceof L.Circle) {
        coordinates = element.getLatLng();
      } else if (element instanceof L.Polygon || element instanceof L.Polyline) {
        coordinates = element.getCenter();
      } else {
        console.error('Unsupported element type for pulse effect');
        return;
      }
      
      // Puls-Element erstellen
      if (mergedOptions.pulseType === 'circle') {
        pulseElement = L.circle(coordinates, {
          radius: mergedOptions.radius,
          color: mergedOptions.color,
          fillColor: mergedOptions.fillColor,
          fillOpacity: mergedOptions.intensity * 0.5,
          opacity: mergedOptions.intensity * 0.8,
          weight: 2
        }).addTo(this.map);
      } else if (mergedOptions.pulseType === 'marker') {
        // Spezielle Marker-Behandlung könnte hier hinzugefügt werden
        pulseElement = L.circle(coordinates, {
          radius: mergedOptions.radius,
          color: mergedOptions.color,
          fillColor: mergedOptions.fillColor,
          fillOpacity: mergedOptions.intensity * 0.5,
          opacity: mergedOptions.intensity * 0.8,
          weight: 2
        }).addTo(this.map);
      }
      
      this.pulseElements.set(id, {
        element,
        pulseElement,
        options: mergedOptions,
        phase: 0,
        active: true,
        coordinates
      });
      
      if (!this.pulseInterval) {
        this.startPulseAnimation();
      }
      
      return pulseElement;
    }
    
    /**
     * Entfernt ein Element mit Puls-Effekt
     * @param {string} id - ID des zu entfernenden Elements
     */
    removePulseElement(id) {
      const item = this.pulseElements.get(id);
      if (item) {
        if (item.pulseElement) {
          this.map.removeLayer(item.pulseElement);
        }
        this.pulseElements.delete(id);
        
        if (this.pulseElements.size === 0) {
          this.stopPulseAnimation();
        }
      }
    }
    
    /**
     * Aktualisiert alle Puls-Effekte
     */
    updatePulseEffects() {
      let hasActiveElements = false;
      
      this.pulseElements.forEach((item, id) => {
        if (!item.active) return;
        
        hasActiveElements = true;
        item.phase += 0.05; // Fortschritt der Animation
        
        if (item.phase >= Math.PI * 2) {
          item.phase = 0;
          
          // Wenn nicht persistent, Element nach einem Zyklus deaktivieren
          if (!item.options.persistent) {
            item.active = false;
            this.map.removeLayer(item.pulseElement);
            return;
          }
        }
        
        // Sinus-Welle für sanfte Animation
        const sinValue = Math.sin(item.phase);
        const normalizedSin = (sinValue + 1) / 2; // Normalisieren auf 0-1
        
        // Radius und Opazität basierend auf Phase berechnen
        const radiusScale = item.options.radius + 
          normalizedSin * (item.options.maxRadius - item.options.radius);
          
        let opacity = item.options.intensity;
        if (item.options.fadeOut) {
          opacity = item.options.intensity * (1 - normalizedSin * 0.8);
        }
        
        // Puls-Element aktualisieren
        if (item.pulseElement instanceof L.Circle) {
          item.pulseElement.setRadius(radiusScale);
          item.pulseElement.setStyle({
            fillOpacity: opacity * 0.5,
            opacity: opacity * 0.8
          });
        }
        
        // Wenn Koordinaten des Quell-Elements geändert wurden, Puls verschieben
        let newCoordinates;
        if (item.element instanceof L.Marker) {
          newCoordinates = item.element.getLatLng();
        } else if (item.element instanceof L.Circle) {
          newCoordinates = item.element.getLatLng();
        } else if (item.element instanceof L.Polygon || item.element instanceof L.Polyline) {
          newCoordinates = item.element.getCenter();
        }
        
        if (newCoordinates && 
            (newCoordinates.lat !== item.coordinates.lat || 
             newCoordinates.lng !== item.coordinates.lng)) {
          item.coordinates = newCoordinates;
          item.pulseElement.setLatLng(newCoordinates);
        }
      });
      
      // Animation stoppen, wenn keine aktiven Elemente mehr vorhanden sind
      if (!hasActiveElements && !this.hasPersistentElements()) {
        this.stopPulseAnimation();
      }
    }
    
    /**
     * Prüft, ob persistente Elemente vorhanden sind
     */
    hasPersistentElements() {
      let hasPersistent = false;
      this.pulseElements.forEach(item => {
        if (item.options.persistent) {
          hasPersistent = true;
        }
      });
      return hasPersistent;
    }
    
    /**
     * Passt die Größe aller Puls-Effekte an den aktuellen Zoom-Level an
     */
    adjustPulseSize() {
      this.pulseElements.forEach((item) => {
        // Zoom-abhängige Skalierung
        const zoomFactor = Math.pow(1.2, this.currentZoom - 13); // Basis-Zoom 13
        
        const newRadius = item.options.radius * zoomFactor;
        const newMaxRadius = item.options.maxRadius * zoomFactor;
        
        if (item.pulseElement instanceof L.Circle) {
          // Aktuelle Phase beibehalten, aber Größe anpassen
          const currentPhase = item.phase;
          const sinValue = Math.sin(currentPhase);
          const normalizedSin = (sinValue + 1) / 2;
          
          const radiusScale = newRadius + 
            normalizedSin * (newMaxRadius - newRadius);
          
          item.pulseElement.setRadius(radiusScale);
        }
      });
    }
    
    /**
     * Fügt einen temporären Puls-Effekt hinzu
     */
    addTemporaryPulse(coordinates, options = {}) {
      const id = 'temp-' + Date.now();
      const tempMarker = L.marker(coordinates, { opacity: 0 }).addTo(this.map);
      
      const defaultOptions = {
        color: '#3273dc',
        fillColor: '#3273dc',
        intensity: 0.8,
        radius: 10,
        duration: 2,
        fadeOut: true,
        persistent: false,
        pulseType: 'circle',
        maxRadius: 50
      };
      
      const mergedOptions = { ...defaultOptions, ...options };
      
      this.addPulseElement(id, tempMarker, mergedOptions);
      
      // Automatisch nach der Dauer entfernen
      setTimeout(() => {
        this.removePulseElement(id);
        this.map.removeLayer(tempMarker);
      }, mergedOptions.duration * 1000 + 100);
    }
    
    /**
     * Fügt einen "Ping"-Effekt an einer Position hinzu
     */
    ping(coordinates, color = '#3273dc') {
      this.addTemporaryPulse(coordinates, {
        color: color,
        fillColor: color,
        radius: 5,
        maxRadius: 30,
        duration: 1.5
      });
    }
    
    /**
     * Fügt einen "Alert"-Effekt an einer Position hinzu
     */
    alert(coordinates, color = '#ff3860') {
      this.addTemporaryPulse(coordinates, {
        color: color,
        fillColor: color,
        radius: 10,
        maxRadius: 50,
        intensity: 1,
        duration: 3
      });
      
      // Zweiten Puls nach kurzer Verzögerung hinzufügen
      setTimeout(() => {
        this.addTemporaryPulse(coordinates, {
          color: color,
          fillColor: color,
          radius: 5,
          maxRadius: 40,
          intensity: 0.8,
          duration: 2
        });
      }, 500);
    }
    
    /**
     * Fügt einen dauerhaften Puls zu einem Element hinzu
     */
    addPersistentPulse(id, element, options = {}) {
      return this.addPulseElement(id, element, {
        ...options,
        persistent: true
      });
    }
  }
  
  // Globale Funktion zum Initialisieren des Pulse-Managers
  function initLivePulse(map) {
    window.livePulseManager = new LivePulseManager(map);
    return window.livePulseManager;
  }
  
  // Beispiel: Event-Handler für neue Notfälle
  function setupEmergencyPulseHandler(pulseMgr) {
    // WebSocket oder Polling einrichten, um neue Notfälle zu erkennen
    const emergencyListener = new EventSource('/api/emergency-stream');
    
    emergencyListener.addEventListener('emergency', (e) => {
      const data = JSON.parse(e.data);
      const coordinates = [data.location.latitude, data.location.longitude];
      
      // Farbe basierend auf Schweregrad wählen
      let color;
      switch (data.severity) {
        case 'high':
          color = '#ff3860'; // Rot
          break;
        case 'medium':
          color = '#ffdd57'; // Gelb
          break;
        default:
          color = '#48c774'; // Grün
      }
      
      // Alert-Effekt anzeigen
      pulseMgr.alert(coordinates, color);
      
      // Optional: Marker mit persistentem Puls-Effekt hinzufügen
      if (data.severity === 'high') {
        const emergencyMarker = L.marker(coordinates).addTo(map);
        pulseMgr.addPersistentPulse('emergency-' + data.id, emergencyMarker, {
          color: color,
          fillColor: color,
          radius: 15,
          maxRadius: 40,
          intensity: 0.7
        });
        
        // Marker nach 5 Minuten oder bei Statusänderung entfernen
        setTimeout(() => {
          map.removeLayer(emergencyMarker);
          pulseMgr.removePulseElement('emergency-' + data.id);
        }, 5 * 60 * 1000);
      }
    });
  }