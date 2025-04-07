const mongoose = require('mongoose');

const culturalEventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ein kulturelles Event muss einen Namen haben'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Ein kulturelles Event muss ein Datum haben']
  },
  type: {
    type: String,
    required: [true, 'Ein kulturelles Event muss einen Typ haben'],
    enum: ['concert', 'exhibition', 'theater', 'festival', 'other']
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Ein kulturelles Event muss einen Ort haben'],
    trim: true
  },
  coordinates: {
    type: [Number],
    required: [true, 'Ein kulturelles Event muss Koordinaten haben']
  },
  districtId: {
    type: mongoose.Schema.ObjectId,
    ref: 'District',
    required: [true, 'Ein kulturelles Event muss einem Bezirk zugeordnet sein']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CulturalEvent = mongoose.model('CulturalEvent', culturalEventSchema);

module.exports = CulturalEvent;