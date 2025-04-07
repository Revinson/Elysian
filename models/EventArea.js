const mongoose = require('mongoose');

const eventAreaSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'Ein Bereich muss einem Event zugeordnet sein']
  },
  name: {
    type: String,
    required: [true, 'Ein Bereich muss einen Namen haben'],
    trim: true
  },
  type: {
    type: String,
    enum: ['stage', 'bar', 'chill', 'food', 'entry', 'exit', 'other'],
    default: 'other'
  },
  coordinates: {
    type: [[Number]],  // Array von Koordinaten-Paaren für die Polygon-Form
    required: [true, 'Ein Bereich muss Koordinaten haben']
  },
  color: {
    type: String,
    default: '#000000'  // Standardfarbe für die Umrisse
  },
  fillColor: {
    type: String,
    default: '#ffffff'  // Standardfarbe für die Füllung
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
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const EventArea = mongoose.model('EventArea', eventAreaSchema);

module.exports = EventArea;