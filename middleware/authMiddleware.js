const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const AppError = require('../utils/appError');

/**
 * Middleware to authenticate user from JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticateToken = async (req, res, next) => {
  try {
    // 1) Get token from Authorization header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      // Alternative: Check for cookie
      token = req.cookies.jwt;
    }

    // 2) Check if token exists
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        error: 'Sie sind nicht eingeloggt. Bitte melden Sie sich an, um Zugriff zu erhalten.'
      });
    }

    // 3) Verify token
    let decoded;
    try {
      decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: 'fail',
        error: 'Ungültiger Token oder Token ist abgelaufen. Bitte erneut anmelden.'
      });
    }

    // 4) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        error: 'Der zu diesem Token gehörende Benutzer existiert nicht mehr.'
      });
    }

    // 5) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'fail',
        error: 'Benutzer hat kürzlich das Passwort geändert. Bitte erneut anmelden.'
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      error: 'Authentifizierung fehlgeschlagen'
    });
  }
};

/**
 * Restrict route access to specific user roles
 * @param  {...String} roles - Allowed roles
 * @returns {Function} Middleware function
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array e.g. ['admin', 'moderator']
    if (!roles.includes(req.user.userRole)) {
      return res.status(403).json({
        status: 'fail',
        error: 'Sie haben keine Berechtigung, diese Aktion durchzuführen'
      });
    }
    next();
  };
};

/**
 * Check if user is authenticated (doesn't send error if not)
 * Used for routes that can be accessed both logged in and anonymously
 */
const isAuthenticated = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      // Alternative: Check for cookie
      token = req.cookies.jwt;
    }

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id);
      
      if (!currentUser) {
        req.user = null;
        return next();
      }

      req.user = currentUser;
      next();
    } catch (err) {
      req.user = null;
      next();
    }
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  restrictTo,
  isAuthenticated
};