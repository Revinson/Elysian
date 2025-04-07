const express = require('express');
const router = express.Router();
const { authenticateToken, restrictTo } = require('../middleware/authMiddleware');
const sanitize = require('../utils/sanitize');
const awarenessController = require('../controllers/awarenessController');

/**
 * GET /api/awareness/safezones/:eventId
 * Holt alle Safe Zones für ein bestimmtes Event
 */
router.get('/safezones/:eventId', awarenessController.getSafeZones);

/**
 * POST /api/awareness/sos
 * Sendet einen SOS-Hilferuf
 */
router.post('/sos', authenticateToken, awarenessController.sendSOS);

/**
 * PUT /api/awareness/sos/:emergencyId
 * Aktualisiert den Status einer SOS-Anfrage (für Team-Mitglieder)
 */
router.put('/sos/:emergencyId', 
  authenticateToken,
  awarenessController.updateSOSResponse
);

/**
 * PUT /api/awareness/team-status
 * Aktualisiert den Status eines Team-Mitglieds
 */
router.put('/team-status', 
  authenticateToken,
  awarenessController.updateTeamMemberStatus
);

/**
 * GET /api/awareness/team-locations/:eventId
 * Holt die Standorte aller Awareness-Teams
 */
router.get('/team-locations/:eventId', awarenessController.getTeamLocations);

/**
 * Nur für Admin/Moderator zugängliche Routen
 */

/**
 * POST /api/awareness/team
 * Erstellt ein neues Awareness-Team
 */
router.post('/team', 
  authenticateToken, 
  restrictTo('admin', 'moderator'), 
  (req, res, next) => {
    // Diese Funktion müsste noch im Controller implementiert werden
    res.status(501).json({
      status: 'error',
      message: 'Noch nicht implementiert'
    });
  }
);

/**
 * PUT /api/awareness/team/:teamId
 * Aktualisiert ein Awareness-Team
 */
router.put('/team/:teamId', 
  authenticateToken, 
  restrictTo('admin', 'moderator'), 
  (req, res, next) => {
    // Diese Funktion müsste noch im Controller implementiert werden
    res.status(501).json({
      status: 'error',
      message: 'Noch nicht implementiert'
    });
  }
);

module.exports = router;