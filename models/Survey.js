const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Survey Schema
 * Definition für Survey-Dokumente in der Datenbank
 */
const surveySchema = new Schema({
  title: {
    type: String,
    required: [true, 'Eine Umfrage muss einen Titel haben'],
    trim: true,
    maxlength: [100, 'Ein Titel darf nicht mehr als 100 Zeichen haben']
  },
  description: {
    type: String,
    trim: true
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  question: {
    type: String,
    required: [true, 'Eine Umfrage muss eine Frage haben'],
    trim: true
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    votes: {
      type: Number,
      default: 0
    }
  }],
  multipleChoice: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Eine Umfrage muss einen Ersteller haben']
  },
  voters: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  closesAt: {
    type: Date,
    default: null
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Methode zur Berechnung der Umfrageergebnisse
 * @returns {Object} Die Ergebnisse der Umfrage
 */
surveySchema.methods.getResults = function() {
  // Gesamtstimmen berechnen
  const totalVotes = this.options.reduce((sum, opt) => sum + opt.votes, 0);
  
  // Prozentanteile berechnen
  const results = this.options.map(opt => ({
    text: opt.text,
    votes: opt.votes,
    percentage: totalVotes > 0 ? (opt.votes / totalVotes * 100).toFixed(1) : 0
  }));
  
  // Nach Stimmen sortieren (absteigend)
  results.sort((a, b) => b.votes - a.votes);
  
  return {
    totalVotes,
    options: results,
    isClosed: this.closesAt && this.closesAt < new Date()
  };
};

/**
 * Query Middleware
 * Filtert standardmäßig inaktive Umfragen
 */
surveySchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  this.populate({
    path: 'createdBy',
    select: 'username'
  });
  
  // EventId ebenfalls populieren, wenn vorhanden
  this.populate({
    path: 'eventId',
    select: 'title date'
  });
  
  next();
});

// Erstellen und exportieren des Modells
const Survey = mongoose.model('Survey', surveySchema);

module.exports = Survey;