const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [20, 'Username cannot exceed 20 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false // Don't include in query results by default
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // This only works on CREATE and SAVE
        validator: function(el) {
          return el === this.password;
        },
        message: 'Passwords do not match'
      }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    userRole: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user'
    },
    age: {
      type: Number,
      min: [13, 'Minimum age is 13 years old'],
      max: [120, 'Maximum age is 120 years old']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say', null],
      default: null
    },
    team: {
      type: String,
      default: null
    },
    roleQuizCompleted: {
      type: Boolean,
      default: false
    },
    roleAnswers: {
      type: String, // JSON string to store quiz answers
      default: null
    },
    finalArchetype: {
      type: String,
      default: null
    },
    eventType: {
      type: String,
      default: null
    },
    lastLogin: {
      type: Date,
      default: Date.now
    },
    active: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property for full name (not stored in DB)
userSchema.virtual('displayName').get(function() {
  return this.username;
});

// DOCUMENT MIDDLEWARE

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
  } catch (error) {
    console.error('Fehler beim Hashen des Passworts:', error);
    next(error);
  }
});

// Update passwordChangedAt when password is changed
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  // Set passwordChangedAt to current time (with 1s buffer to ensure token works)
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// QUERY MIDDLEWARE

// Filter out inactive users
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

// INSTANCE METHODS

// Compare password with hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Ensure we have a password to compare with
    if (!this.password) {
      console.error('Kein Password-Hash vorhanden für Vergleich');
      return false;
    }
    
    // Debug-Ausgabe für Problemlösung
    console.log(`Vergleiche eingegebenes Passwort mit Hash: ${this.password.substring(0, 10)}...`);
    
    // Verwende bcrypt zum Vergleichen
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log(`Passwort-Vergleich Ergebnis: ${isMatch}`);
    return isMatch;
  } catch (error) {
    console.error('Fehler beim Vergleichen des Passworts:', error);
    return false;
  }
};

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and store in DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiration (10 minutes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // Return original token (not hashed)
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;