const express = require('express');
const router = express.Router();
const { authenticateToken, restrictTo } = require('../middleware/authMiddleware');
const sanitize = require('../utils/sanitize');

// Hier würden wir den Controller importieren (muss noch erstellt werden)
const mapController = require('../controllers/mapController');

/**
 * GET /api/map/event/:eventId
 * Holt Daten für ein bestimmtes Event (POIs, Bereiche, etc.)
 */
router.get('/event/:eventId', authenticateToken, mapController.getEventData);

/**
 * GET /api/map/districts
 * Holt Stadtbezirksdaten für die Karte
 */
router.get('/districts', mapController.getDistricts);

/**
 * GET /api/map/cultural-events/:districtId
 * Holt kulturelle Events für einen bestimmten Bezirk
 */
router.get('/cultural-events/:districtId', mapController.getCulturalEvents);

/**
 * GET /api/map/friends/:eventId
 * Holt Positionen der Freunde auf dem Event
 */
router.get('/friends/:eventId', authenticateToken, mapController.getFriendsPositions);

/**
 * POST /api/map/location
 * Aktualisiert die Position des Benutzers
 */
router.post('/location', authenticateToken, mapController.updateUserLocation);

/**
 * GET /api/map/heatmap/:eventId
 * Holt Heatmap-Daten für ein Event
 */
router.get('/heatmap/:eventId', mapController.getHeatmapData);

/**
 * GET /api/map/votings/:eventId
 * Holt aktive Votings auf dem Event
 */
router.get('/votings/:eventId', mapController.getActiveVotings);

/**
 * POST /api/map/vote
 * Gibt eine Stimme bei einem Voting ab
 */
router.post('/vote', authenticateToken, mapController.submitVote);

/**
 * POST /api/map/emergency
 * Sendet einen Notfall-/Hilferuf
 */
router.post('/emergency', authenticateToken, mapController.reportEmergency);

/**
 * GET /api/map/emergency/:emergencyId
 * Holt Status eines Notrufs
 */
router.get('/emergency/:emergencyId', authenticateToken, mapController.getEmergencyStatus);

/**
 * PUT /api/map/emergency/:emergencyId
 * Aktualisiert den Status eines Notrufs (z.B. abbrechen, als gelöst markieren)
 */
router.put('/emergency/:emergencyId', authenticateToken, mapController.updateEmergencyStatus);

/**
 * GET /api/map/staff-locations/:eventId
 * Holt Positionen des Personals (nur für Organisatoren und Admins)
 */
router.get('/staff-locations/:eventId', 
  authenticateToken, 
  restrictTo('admin', 'moderator'), 
  mapController.getStaffLocations
);

/**
 * POST /api/map/announcement
 * Sendet eine Ankündigung an Event-Teilnehmer (nur für Organisatoren und Admins)
 */
router.post('/announcement', 
  authenticateToken, 
  restrictTo('admin', 'moderator'), 
  mapController.sendAnnouncement
);

/**
 * GET /api/map/analytics/:eventId
 * Holt Event-Analytics (nur für Organisatoren und Admins)
 */
router.get('/analytics/:eventId', 
  authenticateToken, 
  restrictTo('admin', 'moderator'), 
  mapController.getEventAnalytics
);

module.exports = router;