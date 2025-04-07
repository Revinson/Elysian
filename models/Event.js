const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Event Schema
 * Definition für Event-Dokumente in der Datenbank
 */
const eventSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Ein Event muss einen Titel haben'],
    trim: true,
    maxlength: [100, 'Ein Titel darf nicht mehr als 100 Zeichen haben']
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Ein Event muss ein Datum haben']
  },
  location: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['online', 'in-person', 'hybrid'],
    default: 'online'
  },
  capacity: {
    type: Number,
    default: null
  },
  organizer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Ein Event muss einen Organisator haben']
  },
  imageUrl: String,
  tags: [String],
  active: {
    type: Boolean,
    default: true,
    select: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  attendees: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'canceled'],
      default: 'registered'
    }
  }],
  attendeeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Middleware vor dem Speichern
 * Aktualisiert automatisch die Anzahl der Teilnehmer
 */
eventSchema.pre('save', function(next) {
  if (this.isModified('attendees')) {
    // Nur aktive Teilnehmer zählen
    this.attendeeCount = this.attendees.filter(
      a => a.status !== 'canceled'
    ).length;
  }
  next();
});

/**
 * Methode zum Hinzufügen eines Teilnehmers
 * @param {String} userId - ID des Benutzers
 * @returns {Boolean} Erfolg der Operation
 */
eventSchema.methods.addAttendee = function(userId) {
  // Prüfen, ob Benutzer bereits registriert ist
  const existingAttendee = this.attendees.find(
    a => a.user.toString() === userId && a.status !== 'canceled'
  );
  
  if (existingAttendee) {
    return false;
  }
  
  // Prüfen, ob Event voll ist
  if (this.capacity !== null && 
      this.attendees.filter(a => a.status !== 'canceled').length >= this.capacity) {
    return false;
  }
  
  // Teilnehmer hinzufügen oder Status aktualisieren
  const canceledAttendee = this.attendees.find(
    a => a.user.toString() === userId && a.status === 'canceled'
  );
  
  if (canceledAttendee) {
    canceledAttendee.status = 'registered';
    canceledAttendee.registeredAt = Date.now();
  } else {
    this.attendees.push({
      user: userId,
      registeredAt: Date.now(),
      status: 'registered'
    });
  }
  
  return true;
};

/**
 * Methode zum Entfernen eines Teilnehmers
 * @param {String} userId - ID des Benutzers
 * @returns {Boolean} Erfolg der Operation
 */
eventSchema.methods.removeAttendee = function(userId) {
  // Prüfen, ob Benutzer registriert ist
  const attendee = this.attendees.find(
    a => a.user.toString() === userId && a.status !== 'canceled'
  );
  
  if (!attendee) {
    return false;
  }
  
  // Status auf 'canceled' setzen
  attendee.status = 'canceled';
  return true;
};

/**
 * Statische Methode zum Finden kommender Events
 */
eventSchema.statics.findUpcoming = function() {
  return this.find({
    date: { $gte: new Date() },
    active: true
  }).sort({ date: 1 });
};

/**
 * Query Middleware
 * Filtert standardmäßig inaktive Events
 */
eventSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  this.populate({
    path: 'organizer',
    select: 'username email'
  });
  next();
});

// Erstellen und exportieren des Modells
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;