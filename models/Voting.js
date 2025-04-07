const mongoose = require('mongoose');

const votingOptionSchema = new mongoose.Schema({
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

const votingSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'Ein Voting muss einem Event zugeordnet sein']
  },
  name: {
    type: String,
    required: [true, 'Ein Voting muss einen Namen haben'],
    trim: true
  },
  coordinates: {
    type: [Number],
    required: [true, 'Ein Voting muss Koordinaten haben']
  },
  active: {
    type: Boolean,
    default: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: [true, 'Ein Voting muss eine Endzeit haben']
  },
  options: {
    type: [votingOptionSchema],
    validate: {
      validator: function(v) {
        return v.length >= 2; // Mindestens 2 Optionen
      },
      message: 'Ein Voting muss mindestens 2 Optionen haben'
    }
  },
  voters: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Voting = mongoose.model('Voting', votingSchema);

module.exports = Voting;