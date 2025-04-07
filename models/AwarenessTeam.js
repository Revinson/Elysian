const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * AwarenessTeam Schema
 * Repräsentiert ein Awareness-Team in einer Safe Zone
 */
const awarenessTeamSchema = new Schema({
  safeZoneId: {
    type: Schema.Types.ObjectId,
    ref: 'POI',
    required: true
  },
  members: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    role: {
      type: String,
      enum: ['lead', 'member', 'medical', 'security'],
      default: 'member'
    },
    status: {
      type: String,
      enum: ['available', 'responding', 'break', 'offline'],
      default: 'available'
    },
    location: {
      latitude: Number,
      longitude: Number,
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }
  }],
  activeResponses: [{
    emergencyId: {
      type: Schema.Types.ObjectId,
      ref: 'Emergency'
    },
    responderId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['en-route', 'on-scene', 'returning'],
      default: 'en-route'
    },
    startedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'limited', 'closed'],
    default: 'active'
  },
  capacity: {
    total: {
      type: Number,
      default: 5
    },
    current: {
      type: Number,
      default: 0
    }
  },
  services: [{
    type: String,
    enum: ['escort', 'medical-basic', 'medical-advanced', 'water', 'rest-area', 'charging', 'information', 'drug-safety']
  }],
  openingHours: {
    from: String,
    to: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Vor dem Speichern updatedAt aktualisieren
awarenessTeamSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Hilfsmethode, um verfügbaren Mitarbeiter zu finden
awarenessTeamSchema.methods.findAvailableMember = function(preferredRole = null) {
  const availableMembers = this.members.filter(member => member.status === 'available');
  
  if (preferredRole && availableMembers.some(member => member.role === preferredRole)) {
    return availableMembers.find(member => member.role === preferredRole);
  }
  
  return availableMembers.length > 0 ? availableMembers[0] : null;
};

// Methode zum Aktualisieren der Kapazität basierend auf verfügbaren Mitgliedern
awarenessTeamSchema.methods.updateCapacity = function() {
  const availableCount = this.members.filter(member => 
    ['available', 'responding'].includes(member.status)
  ).length;
  
  this.capacity.current = availableCount;
  
  if (availableCount === 0) {
    this.status = 'closed';
  } else if (availableCount < 2) {
    this.status = 'limited';
  } else {
    this.status = 'active';
  }
  
  return this.save();
};

const AwarenessTeam = mongoose.model('AwarenessTeam', awarenessTeamSchema);

module.exports = AwarenessTeam;