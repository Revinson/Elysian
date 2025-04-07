const express = require('express');
const router = express.Router();
const User = require('../models/User');
const userController = require('../controllers/userController');
const { authenticateToken, restrictTo } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const sanitize = require('../utils/sanitize');

/**
 * POST /users/register
 * Register a new user
 */
router.post('/register', userController.registerUser);

/**
 * POST /users/login
 * Login a user
 */
router.post('/login', userController.loginUser);

/**
 * GET /users/profile
 * Get current user profile
 */
router.get('/profile', authenticateToken, userController.getProfile);

/**
 * PATCH /users/profile
 * Update user profile
 */
router.patch('/profile', authenticateToken, userController.updateProfile);

/**
 * PATCH /users/password
 * Update user password
 */
router.patch('/password', authenticateToken, userController.updatePassword);

/**
 * POST /users/forgotPassword
 * Request password reset
 */
router.post('/forgotPassword', userController.forgotPassword);

/**
 * PATCH /users/resetPassword/:token
 * Reset password with token
 */
router.patch('/resetPassword/:token', userController.resetPassword);

/**
 * PUT /users/roleQuiz
 * Update role quiz data
 */
router.put('/roleQuiz', authenticateToken, userController.updateRoleQuiz);

/**
 * POST /users/update-archetype
 * Update user archetype
 */
router.post('/update-archetype', authenticateToken, userController.updateArchetype);

/**
 * GET /users
 * Get all users (admin only)
 */
router.get('/', authenticateToken, restrictTo('admin'), userController.getAllUsers);

module.exports = router;