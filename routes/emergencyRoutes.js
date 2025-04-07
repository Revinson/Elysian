/**
 * routes/emergencyRoutes.js
 * Routen für Notfälle und SSE-Streams
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, restrictTo } = require('../middleware/authMiddleware');
const emergencyStreamController = require('../controllers/emergencyStreamController');

/**
 * GET /api/emergency/stream
 * SSE-Stream für Echtzeit-Benachrichtigungen über Notfälle
 */
router.get('/stream', emergencyStreamController.subscribeToEmergencyStream);

module.exports = router;