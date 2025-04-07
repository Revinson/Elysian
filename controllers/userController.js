const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const AppError = require('../utils/appError');
const sanitize = require('../utils/sanitize');
const sendEmail = require('../utils/email');

/**
 * Generate JWT token for a user
 * @param {Object} user - User document
 * @returns {String} JWT token
 */
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.userRole },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};

/**
 * Create and send token as response
 * @param {Object} user - User document
 * @param {Number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user);
  
  // Update last login time
  user.lastLogin = Date.now();
  user.save({ validateBeforeSave: false });

  // Send response with token
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: sanitize.safeUserObject(user)
    }
  });
};

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.registerUser = async (req, res, next) => {
  try {
    // Sanitize input data
    const sanitizedBody = sanitize.requestBody(req.body);
    const { username, email, password, passwordConfirm, age, gender } = sanitizedBody;

    // Validate required fields
    if (!username || !email || !password || !passwordConfirm) {
      return res.status(400).json({ error: 'Please provide username, email, and password' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username: username.toLowerCase() }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Create new user
    const newUser = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      passwordConfirm,
      age: age || null,
      gender: gender || null,
      userRole: 'user' // Default role
    });

    // Send welcome email
    try {
      await sendEmail({
        email: newUser.email,
        subject: 'Welcome to Elysium!',
        message: `Hi ${newUser.username},\n\nWelcome to Elysium! We're excited to have you on board.\n\nPlease complete your profile to get started.`
      });
    } catch (err) {
      console.log('Email could not be sent, but user was registered successfully');
    }

    // Send token
    createSendToken(newUser, 201, res);
  } catch (error) {
    res.status(500).json({ error: 'Error in user registration: ' + error.message });
  }
};

/**
 * Login user - DEBUG VERSION
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.loginUser = async (req, res, next) => {
  try {
    console.log("LOGIN VERSUCH - Request Body:", req.body);
    
    // Extrahiere Eingabefelder - Wir akzeptieren jeden der beiden
    const { username, email, password } = req.body;
    
    console.log("Extrahierte Werte - username:", username, "email:", email, "password (vorhanden):", !!password);
    
    // Verwende den vom Client gesendeten Wert (entweder username oder email)
    const loginIdentifier = username || email;
    
    console.log("Verwendeter Identifier für Login:", loginIdentifier);

    // Check if identifier and password exist
    if (!loginIdentifier || !password) {
      console.log("FEHLER: Fehlende Anmeldedaten");
      return res.status(400).json({ 
        status: 'fail',
        error: 'Bitte Benutzername/E-Mail und Passwort angeben' 
      });
    }

    // Suche nach Benutzer - SEHR WICHTIG: Debug-Ausgabe vor und nach der Abfrage
    console.log("Suche nach Benutzer mit Identifier:", loginIdentifier);
    
    // DEBUG: Zuerst nach genau diesem Wert als Username suchen
    const userByUsername = await User.findOne({ username: loginIdentifier.toLowerCase() }).select('+password');
    console.log("Benutzer nach Username gefunden:", !!userByUsername);
    
    // DEBUG: Dann nach genau diesem Wert als Email suchen
    const userByEmail = await User.findOne({ email: loginIdentifier.toLowerCase() }).select('+password');
    console.log("Benutzer nach Email gefunden:", !!userByEmail);
    
    // Kombinierte Suche - wie vorher
    const user = await User.findOne({
      $or: [
        { username: loginIdentifier.toLowerCase() },
        { email: loginIdentifier.toLowerCase() }
      ]
    }).select('+password');
    
    console.log("Benutzer mit kombinierter Suche gefunden:", !!user);
    
    // Falls noch keine User gefunden wurden, schauen wir uns die gesamte User-Sammlung an
    if (!user) {
      console.log("KEIN BENUTZER GEFUNDEN - Überprüfe alle Benutzer in der Datenbank");
      const allUsers = await User.find({}, 'username email'); // Nur diese Felder anzeigen
      console.log("Alle Benutzer:", JSON.stringify(allUsers));
    }

    // Check if user exists
    if (!user) {
      console.log("FEHLER: Benutzer nicht gefunden");
      return res.status(401).json({ 
        status: 'fail',
        error: 'Ungültige Anmeldedaten' 
      });
    }

    // Überprüfen Sie, ob die comparePassword-Methode existiert
    console.log("comparePassword Methode existiert:", typeof user.comparePassword === 'function');
    
    // Check if password is correct
    let isPasswordCorrect = false;
    try {
      isPasswordCorrect = await user.comparePassword(password);
      console.log("Passwort-Überprüfung Ergebnis:", isPasswordCorrect);
    } catch (err) {
      console.error("FEHLER bei Passwort-Überprüfung:", err);
      return res.status(500).json({ 
        status: 'error',
        error: 'Interner Fehler bei der Passwortüberprüfung' 
      });
    }
    
    if (!isPasswordCorrect) {
      console.log("FEHLER: Falsches Passwort");
      return res.status(401).json({ 
        status: 'fail',
        error: 'Ungültige Anmeldedaten' 
      });
    }

    // Erstelle Token und sende Antwort
    console.log("LOGIN ERFOLGREICH - Erstelle Token");
    createSendToken(user, 200, res);
    
  } catch (error) {
    console.error("SCHWERWIEGENDER FEHLER beim Login:", error);
    res.status(500).json({ 
      status: 'error',
      error: 'Fehler beim Login: ' + error.message 
    });
  }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: sanitize.safeUserObject(user)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error getting profile: ' + error.message });
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateProfile = async (req, res, next) => {
  try {
    // Filter out fields that are not allowed to be updated
    const sanitizedBody = sanitize.requestBody(req.body);
    const filteredBody = {};
    const allowedFields = ['username', 'email', 'age', 'gender'];
    
    Object.keys(sanitizedBody).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = sanitizedBody[key];
      }
    });

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: sanitize.safeUserObject(updatedUser)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating profile: ' + error.message });
  }
};

/**
 * Update user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return res.status(400).json({ error: 'Please provide current password and new password' });
    }

    // Get user
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if current password is correct
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();

    // Send new token
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ error: 'Error updating password: ' + error.message });
  }
};

/**
 * Forgot password - send reset email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if email exists
    if (!email) {
      return res.status(400).json({ error: 'Please provide email' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'No user found with that email' });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    // Send email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset (valid for 10 minutes)',
        message: `Forgot your password? Submit a request with your new password to: ${resetURL}\nIf you didn't forget your password, please ignore this email.`
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email'
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ error: 'There was an error sending the email. Try again later.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error in forgot password: ' + error.message });
  }
};

/**
 * Reset password using token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;

    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    // Check if token is valid
    if (!user) {
      return res.status(400).json({ error: 'Token is invalid or has expired' });
    }

    // Update password
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send new token
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ error: 'Error in reset password: ' + error.message });
  }
};

/**
 * Update user role quiz data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateRoleQuiz = async (req, res, next) => {
  try {
    const { roleAnswers } = req.body;

    if (!roleAnswers) {
      return res.status(400).json({ error: 'Role answers are required' });
    }

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update quiz data
    user.roleAnswers = JSON.stringify(roleAnswers);
    user.roleQuizCompleted = true;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: {
        user: sanitize.safeUserObject(user)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating role quiz: ' + error.message });
  }
};

/**
 * Update user archetype
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateArchetype = async (req, res, next) => {
  try {
    const { roleAnswers, finalArchetype } = req.body;

    if (!finalArchetype) {
      return res.status(400).json({ error: 'Archetype is required' });
    }

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update archetype
    user.finalArchetype = finalArchetype;

    // Save role answers if provided
    if (roleAnswers) {
      user.roleAnswers = JSON.stringify(roleAnswers);
    }

    // Mark quiz as completed if it wasn't already
    if (!user.roleQuizCompleted) {
      user.roleQuizCompleted = true;
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Archetype successfully updated',
      data: {
        archetype: finalArchetype
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating archetype: ' + error.message });
  }
};

/**
 * Get all users (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    // Map to safe user objects
    const safeUsers = users.map(user => sanitize.safeUserObject(user));

    res.status(200).json({
      status: 'success',
      results: safeUsers.length,
      data: {
        users: safeUsers
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error getting users: ' + error.message });
  }
};