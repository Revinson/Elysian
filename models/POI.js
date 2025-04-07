const mongoose = require('mongoose');

const poiSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'Ein POI muss einem Event zugeordnet sein']
  },
  name: {
    type: String,
    required: [true, 'Ein POI muss einen Namen haben'],
    trim: true
  },
  type: {
    type: String,
    enum: ['dancefloor', 'bar', 'food', 'toilet', 'info', 'safezone', 'cultural', 'other'],
    required: [true, 'Ein POI muss einen Typ haben']
  },
  coordinates: {
    type: [Number],
    required: [true, 'Ein POI muss Koordinaten haben']
  },
  // Spezifische Felder je nach POI-Typ
  // Dancefloor
  currentDJ: {
    type: String,
    trim: true
  },
  genre: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number
  },
  currentLoad: {
    type: Number,
    default: 0
  },
  voteActive: {
    type: Boolean,
    default: false
  },
  // Bar
  drinks: {
    type: [String]
  },
  waitTime: {
    type: Number,
    default: 0
  },
  special: {
    type: String,
    trim: true
  },
  // Safezone
  safeType: {
    type: String,
    enum: ['medical', 'quiet', 'security'],
    default: 'quiet'
  },
  features: {
    type: [String]
  },
  occupied: {
    type: Boolean,
    default: false
  },
  // Cultural
  eventType: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fee: {
    type: Number,
    default: 0
  },
  time: {
    type: String,
    trim: true
  },
  // Allgemein
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const POI = mongoose.model('POI', poiSchema);

module.exports = POI;