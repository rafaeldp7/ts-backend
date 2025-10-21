const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  motorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Motor',
    required: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  
  // Estimated (Planned) data
  distance: {
    type: Number,
    min: 0,
    default: 0
  },
  fuelUsedMin: {
    type: Number,
    min: 0,
    default: 0
  },
  fuelUsedMax: {
    type: Number,
    min: 0,
    default: 0
  },
  eta: {
    type: String
  },
  timeArrived: {
    type: String
  },
  
  // Actual (Tracked) data
  tripStartTime: {
    type: Date,
    required: true
  },
  tripEndTime: {
    type: Date
  },
  actualDistance: {
    type: Number,
    min: 0,
    default: 0
  },
  actualFuelUsedMin: {
    type: Number,
    min: 0,
    default: 0
  },
  actualFuelUsedMax: {
    type: Number,
    min: 0,
    default: 0
  },
  duration: {
    type: Number, // in minutes
    min: 0,
    default: 0
  },
  kmph: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Location data
  startLocation: {
    address: {
      type: String,
      required: true
    },
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  endLocation: {
    address: {
      type: String,
      required: true
    },
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  
  // Routing data
  plannedPolyline: {
    type: String
  },
  actualPolyline: {
    type: String
  },
  wasRerouted: {
    type: Boolean,
    default: false
  },
  rerouteCount: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Background & Analytics
  wasInBackground: {
    type: Boolean,
    default: false
  },
  showAnalyticsModal: {
    type: Boolean,
    default: false
  },
  analyticsNotes: {
    type: String,
    trim: true
  },
  trafficCondition: {
    type: String,
    enum: ['light', 'moderate', 'heavy', 'severe'],
    default: 'moderate'
  },
  
  // Trip Summary
  isSuccessful: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'cancelled', 'failed'],
    default: 'planned'
  },
  
  // Additional metadata
  weather: {
    temperature: Number,
    condition: String,
    humidity: Number
  },
  notes: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
tripSchema.index({ userId: 1 });
tripSchema.index({ motorId: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ tripStartTime: -1 });
tripSchema.index({ userId: 1, status: 1 });
tripSchema.index({ userId: 1, tripStartTime: -1 });

// Virtual for trip duration in hours
tripSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

// Virtual for average speed
tripSchema.virtual('avgSpeed').get(function() {
  return this.kmph;
});

// Virtual for fuel efficiency
tripSchema.virtual('fuelEfficiency').get(function() {
  if (this.actualFuelUsedMin > 0) {
    return this.actualDistance / this.actualFuelUsedMin;
  }
  return 0;
});

// Method to complete trip
tripSchema.methods.complete = function(endTime, finalStats = {}) {
  this.status = 'completed';
  this.tripEndTime = endTime || new Date();
  this.duration = Math.round((this.tripEndTime - this.tripStartTime) / (1000 * 60)); // minutes
  
  // Update with final stats
  Object.assign(this, finalStats);
  
  return this.save();
};

// Method to cancel trip
tripSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.tripEndTime = new Date();
  return this.save();
};

// Method to update route
tripSchema.methods.updateRoute = function(plannedPolyline, actualPolyline) {
  if (plannedPolyline) this.plannedPolyline = plannedPolyline;
  if (actualPolyline) this.actualPolyline = actualPolyline;
  return this.save();
};

// Method to add reroute
tripSchema.methods.addReroute = function() {
  this.wasRerouted = true;
  this.rerouteCount += 1;
  return this.save();
};

// Static method to get user trips
tripSchema.statics.getUserTrips = function(userId, options = {}) {
  const {
    status,
    motorId,
    startDate,
    endDate,
    limit = 10,
    page = 1,
    sortBy = 'tripStartTime',
    sortOrder = 'desc'
  } = options;

  const filter = { userId };
  if (status) filter.status = status;
  if (motorId) filter.motorId = motorId;
  if (startDate || endDate) {
    filter.tripStartTime = {};
    if (startDate) filter.tripStartTime.$gte = new Date(startDate);
    if (endDate) filter.tripStartTime.$lte = new Date(endDate);
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(filter)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('motorId', 'nickname brand model');
};

// Static method to get trip statistics
tripSchema.statics.getTripStats = function(userId, period = '30d') {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        tripStartTime: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        totalDistance: { $sum: '$actualDistance' },
        totalDuration: { $sum: '$duration' },
        avgSpeed: { $avg: '$kmph' },
        totalFuelUsed: { $sum: '$actualFuelUsedMin' },
        completedTrips: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Trip', tripSchema);
