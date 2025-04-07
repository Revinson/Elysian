/**
 * controllers/emergencyStreamController.js
 * Stellt Server-Sent Events für Echtzeit-Updates zu Notfällen bereit
 */

// Liste verbundener Clients
const clients = [];

/**
 * Fügt einen Client zum SSE-Stream hinzu
 */
exports.subscribeToEmergencyStream = (req, res) => {
  // SSE Headers setzen
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Initiale Nachricht senden
  res.write('data: {"type":"connection","message":"Connected to emergency stream"}\n\n');
  
  // Client-ID generieren
  const clientId = Date.now();
  
  // Neuen Client erstellen
  const newClient = {
    id: clientId,
    res
  };
  
  // Zur Client-Liste hinzufügen
  clients.push(newClient);
  
  console.log(`Client ${clientId} mit Stream verbunden`);
  
  // Event-Handler für Verbindungsabbruch
  req.on('close', () => {
    console.log(`Client ${clientId} hat die Verbindung getrennt`);
    const index = clients.findIndex(client => client.id === clientId);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
};

/**
 * Sendet einen Notfall an alle verbundenen Clients
 * @param {Object} emergency - Notfalldaten
 */
exports.broadcastEmergency = (emergency) => {
  console.log(`Sende Notfall an ${clients.length} verbundene Clients`);
  
  // An alle verbundenen Clients senden
  clients.forEach(client => {
    client.res.write(`event: emergency\ndata: ${JSON.stringify(emergency)}\n\n`);
  });
};

/**
 * Sendet ein Safe-Zone-Update an alle verbundenen Clients
 * @param {Object} safeZone - Safe-Zone-Daten
 */
exports.broadcastSafeZoneUpdate = (safeZone) => {
  clients.forEach(client => {
    client.res.write(`event: safezone\ndata: ${JSON.stringify(safeZone)}\n\n`);
  });
};

/**
 * Sendet ein Team-Update an alle verbundenen Clients
 * @param {Object} teamUpdate - Team-Update-Daten
 */
exports.broadcastTeamUpdate = (teamUpdate) => {
  clients.forEach(client => {
    client.res.write(`event: team\ndata: ${JSON.stringify(teamUpdate)}\n\n`);
  });
};