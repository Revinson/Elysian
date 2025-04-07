const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Ein Notfall muss einem Benutzer zugeordnet sein']
  },
  eventId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'Ein Notfall muss einem Event zugeordnet sein']
  },
  type: {
    type: String,
    enum: ['medical', 'security', 'friend', 'exit', 'other'],
    required: [true, 'Ein Notfall muss einen Typ haben']
  },
  message: {
    type: String,
    trim: true
  },
  location: {
    latitude: {
      type: Number,
      required: [true, 'Ein Notfall muss eine Breitengrad haben']
    },
    longitude: {
      type: Number,
      required: [true, 'Ein Notfall muss eine Längengrad haben']
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
  responderId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  responderType: {
    type: String,
    enum: ['security', 'medical', 'staff']
  },
  estimatedResponseTime: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  }
});

const Emergency = mongoose.model('Emergency', emergencySchema);

module.exports = Emergency;