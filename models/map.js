/**
 * models/map.js
 * Enthält alle für die Kartenfunktionalität benötigten Modelle
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * UserLocation Schema
 * Speichert die Position eines Benutzers auf einem Event
 */
const userLocationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indizes für effiziente Abfragen
userLocationSchema.index({ userId: 1, eventId: 1 }, { unique: true });
userLocationSchema.index({ eventId: 1, updatedAt: -1 });

/**
 * District Schema
 * Stadtbezirke für die Kartenansicht
 */
const districtSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    type: [[Number, Number]],
    required: true,
    validate: {
      validator: function(coords) {
        return coords.length >= 3;
      },
      message: 'Ein Bezirk muss mindestens aus einem Dreieck bestehen (3+ Koordinatenpunkte)'
    }
  },
  color: {
    type: String,
    default: '#FF5722'
  },
  fillColor: {
    type: String,
    default: '#FF5722'
  },
  info: {
    type: String,
    trim: true
  }
}, { timestamps: true });

/**
 * CulturalEvent Schema
 * Kulturelle Veranstaltungen in den Stadtbezirken
 */
const culturalEventSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Musik', 'Ausstellung', 'Theater', 'Festival', 'Tour', 'Workshop', 'Sonstiges'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  districtId: {
    type: Schema.Types.ObjectId,
    ref: 'District',
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  coordinates: {
    type: [Number, Number], // [latitude, longitude]
    required: true
  }
}, { timestamps: true });

/**
 * EventArea Schema
 * Bereiche innerhalb eines Events (Dancefloor, Ruhezone, etc.)
 */
const eventAreaSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Dancefloor', 'Ruhezone', 'VIP', 'Bar', 'Eingang', 'Sonstiges'],
    default: 'Sonstiges'
  },
  coordinates: {
    type: [[Number, Number]],
    required: true,
    validate: {
      validator: function(coords) {
        return coords.length >= 3;
      },
      message: 'Ein Bereich muss mindestens aus einem Dreieck bestehen (3+ Koordinatenpunkte)'
    }
  },
  color: {
    type: String,
    default: '#c13afc'
  },
  fillColor: {
    type: String,
    default: '#c13afc'
  },
  capacity: {
    type: Number,
    default: 0
  },
  currentVisitors: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  }
}, { timestamps: true });

/**
 * POI Schema
 * Points of Interest auf der Karte (Dancefloors, Bars, Safezones, etc.)
 */
const poiSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['dancefloor', 'bar', 'safezone', 'cultural', 'entrance', 'restroom', 'other'],
    required: true
  },
  coordinates: {
    type: [Number, Number], // [latitude, longitude]
    required: true
  },
  // Gemeinsame Felder
  description: {
    type: String,
    trim: true
  },
  
  // Dancefloor-spezifische Felder
  currentDJ: String,
  genre: String,
  capacity: Number,
  currentLoad: Number, // Prozentsatz
  voteActive: {
    type: Boolean,
    default: false
  },
  
  // Bar-spezifische Felder
  drinks: [String],
  waitTime: String,
  special: String,
  
  // Safezone-spezifische Felder
  safeType: {
    type: String,
    enum: ['Erste Hilfe', 'Ruhebereich', 'Awareness', 'Security'],
  },
  features: [String],
  occupied: {
    type: Boolean,
    default: false
  },
  
  // Kulturelle POI-spezifische Felder
  eventType: String,
  fee: String,
  time: String
}, { timestamps: true });

/**
 * VotingOption Schema (Eingebettetes Schema für Voting)
 */
const votingOptionSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  votes: {
    type: Number,
    default: 0
  }
}, { _id: true });

/**
 * Voting Schema
 * Live-Voting auf Events (DJ-Wahl, Musikrichtung, etc.)
 */
const votingSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    type: [Number, Number], // [latitude, longitude]
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  options: [votingOptionSchema],
  voters: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

/**
 * Emergency Schema
 * Notfälle und Hilferufe auf Events
 */
const emergencySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  type: {
    type: String,
    enum: ['medical', 'security', 'friend', 'exit', 'other'],
    required: true
  },
  message: {
    type: String,
    trim: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'resolved', 'cancelled'],
    default: 'pending'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  responderId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  responderType: String,
  estimatedResponseTime: String,
  resolvedAt: Date
}, { timestamps: true });

// Modelle erstellen
const UserLocation = mongoose.model('UserLocation', userLocationSchema);
const District = mongoose.model('District', districtSchema);
const CulturalEvent = mongoose.model('CulturalEvent', culturalEventSchema);
const EventArea = mongoose.model('EventArea', eventAreaSchema);
const POI = mongoose.model('POI', poiSchema);
const Voting = mongoose.model('Voting', votingSchema);
const Emergency = mongoose.model('Emergency', emergencySchema);

// Alle Modelle exportieren
module.exports = {
  UserLocation,
  District,
  CulturalEvent,
  EventArea,
  POI,
  Voting,
  Emergency
};