// Füge diesen Code in ein separates Skript ein, das vor deinem map.js-Skript geladen wird
// Speichere es z.B. als public/js/leaflet-canvas-fix.js

(function() {
    // Warten bis Leaflet geladen ist
    const checkLeafletInterval = setInterval(() => {
      if (typeof L !== 'undefined') {
        clearInterval(checkLeafletInterval);
        
        // Original-Methode sichern
        const originalUtilGetCanvas = L.Util.getCanvas;
        
        // Monkeypatch für L.Util.getCanvas - wird von Heatmap verwendet
        if (originalUtilGetCanvas) {
          L.Util.getCanvas = function() {
            const canvas = originalUtilGetCanvas.call(this);
            
            // Optimierter Kontext mit willReadFrequently
            const originalGetContext = canvas.getContext;
            canvas.getContext = function(type, options = {}) {
              if (type === '2d') {
                options.willReadFrequently = true;
              }
              return originalGetContext.call(this, type, options);
            };
            
            return canvas;
          };
          
          console.log("Leaflet Canvas-Patch für verbesserte Leistung angewendet");
        }
      }
    }, 10);
  })();