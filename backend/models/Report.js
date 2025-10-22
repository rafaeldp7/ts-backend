const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['accident', 'construction', 'hazard', 'traffic_jam', 'road_closed', 'other'],
    default: 'other'
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && 
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates'
      }
    },
    address: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'archived'],
    default: 'active'
  },
  archived: {
    type: Boolean,
    default: false
  },
  votes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    voteType: {
      type: String,
      enum: ['upvote', 'downvote'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  estimatedDuration: {
    type: Number, // in minutes
    min: 0,
    max: 1440 // 24 hours
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  verificationNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Geospatial index for location queries
reportSchema.index({ location: '2dsphere' });
reportSchema.index({ userId: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ archived: 1 });
reportSchema.index({ type: 1 });
reportSchema.index({ severity: 1 });
reportSchema.index({ createdAt: -1 });

// Virtual for vote count
reportSchema.virtual('voteCount').get(function() {
  return this.votes.length;
});

// Virtual for upvote count
reportSchema.virtual('upvoteCount').get(function() {
  return this.votes.filter(vote => vote.voteType === 'upvote').length;
});

// Virtual for downvote count
reportSchema.virtual('downvoteCount').get(function() {
  return this.votes.filter(vote => vote.voteType === 'downvote').length;
});

// Method to add vote
reportSchema.methods.addVote = function(userId, voteType) {
  // Remove existing vote from this user
  this.votes = this.votes.filter(vote => vote.userId.toString() !== userId.toString());
  
  // Add new vote
  this.votes.push({
    userId,
    voteType,
    timestamp: new Date()
  });
  
  return this.save();
};

// Method to remove vote
reportSchema.methods.removeVote = function(userId) {
  this.votes = this.votes.filter(vote => vote.userId.toString() !== userId.toString());
  return this.save();
};

// Method to archive report
reportSchema.methods.archive = function() {
  this.archived = true;
  this.status = 'archived';
  return this.save();
};

// Method to resolve report
reportSchema.methods.resolve = function(resolvedBy) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.resolvedBy = resolvedBy;
  return this.save();
};

// Static method to find nearby reports
reportSchema.statics.findNearby = function(latitude, longitude, radiusInKm = 5) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusInKm * 1000 // Convert km to meters
      }
    },
    status: { $ne: 'archived' },
    archived: { $ne: true }
  });
};

module.exports = mongoose.model('Report', reportSchema);
