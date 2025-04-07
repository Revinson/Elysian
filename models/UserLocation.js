const mongoose = require('mongoose');

const userLocationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Ein Standort muss einem Benutzer zugeordnet sein']
  },
  eventId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'Ein Standort muss einem Event zugeordnet sein']
  },
  latitude: {
    type: Number,
    required: [true, 'Ein Standort muss eine Breitengrad haben']
  },
  longitude: {
    type: Number,
    required: [true, 'Ein Standort muss eine Längengrad haben']
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound-Index für schnelle Abfragen nach userId und eventId
userLocationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const UserLocation = mongoose.model('UserLocation', userLocationSchema);

module.exports = UserLocation;