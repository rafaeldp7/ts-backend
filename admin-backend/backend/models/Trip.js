const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  // Trip Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  motorcycle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Motorcycle',
    required: [true, 'Motorcycle is required']
  },
  
  // Trip Details
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Route Information
  startLocation: {
    address: {
      type: String,
      required: [true, 'Start address is required'],
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Start latitude is required'],
        min: [-90, 'Invalid latitude'],
        max: [90, 'Invalid latitude']
      },
      lng: {
        type: Number,
        required: [true, 'Start longitude is required'],
        min: [-180, 'Invalid longitude'],
        max: [180, 'Invalid longitude']
      }
    }
  },
  endLocation: {
    address: {
      type: String,
      required: [true, 'End address is required'],
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'End latitude is required'],
        min: [-90, 'Invalid latitude'],
        max: [90, 'Invalid latitude']
      },
      lng: {
        type: Number,
        required: [true, 'End longitude is required'],
        min: [-180, 'Invalid longitude'],
        max: [180, 'Invalid longitude']
      }
    }
  },
  
  // Route Points (for detailed tracking)
  routePoints: [{
    coordinates: {
      lat: Number,
      lng: Number
    },
    timestamp: Date,
    speed: Number, // km/h
    altitude: Number
  }],
  
  // Trip Metrics
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0, 'Distance cannot be negative']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [0, 'Duration cannot be negative']
  },
  averageSpeed: {
    type: Number,
    min: [0, 'Average speed cannot be negative']
  },
  maxSpeed: {
    type: Number,
    min: [0, 'Max speed cannot be negative']
  },
  
  // Fuel Information
  fuelConsumption: {
    type: Number,
    min: [0, 'Fuel consumption cannot be negative']
  },
  fuelCost: {
    type: Number,
    min: [0, 'Fuel cost cannot be negative']
  },
  fuelEfficiency: {
    type: Number,
    min: [0, 'Fuel efficiency cannot be negative']
  },
  
  // Time Information
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  plannedStartTime: Date,
  plannedEndTime: Date,
  
  // Trip Status
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'cancelled', 'paused'],
    default: 'planned'
  },
  
  // Weather Information
  weather: {
    condition: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy', 'unknown']
    },
    temperature: Number,
    humidity: Number,
    windSpeed: Number
  },
  
  // Traffic Information
  traffic: {
    level: {
      type: String,
      enum: ['light', 'moderate', 'heavy', 'severe'],
      default: 'moderate'
    },
    delays: [{
      location: String,
      duration: Number, // in minutes
      reason: String
    }]
  },
  
  // Expenses
  expenses: [{
    type: {
      type: String,
      enum: ['fuel', 'toll', 'parking', 'maintenance', 'other'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Expense amount cannot be negative']
    },
    description: String,
    location: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Notes and Tags
  notes: [{
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: {
      coordinates: {
        lat: Number,
        lng: Number
      },
      address: String
    }
  }],
  tags: [String],
  
  // Photos and Media
  photos: [{
    filename: String,
    url: String,
    caption: String,
    location: {
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Statistics
  stats: {
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
  },
  
  // Privacy Settings
  isPublic: {
    type: Boolean,
    default: false
  },
  isShared: {
    type: Boolean,
    default: false
  },
  
  // System Information
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
tripSchema.index({ user: 1 });
tripSchema.index({ motorcycle: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ startTime: -1 });
tripSchema.index({ endTime: -1 });
tripSchema.index({ 'startLocation.coordinates': '2dsphere' });
tripSchema.index({ 'endLocation.coordinates': '2dsphere' });
tripSchema.index({ tags: 1 });
tripSchema.index({ isPublic: 1 });
tripSchema.index({ isArchived: 1 });

// Virtual for trip duration in hours
tripSchema.virtual('durationHours').get(function() {
  return this.duration / 60; // Convert minutes to hours
});

// Virtual for average speed in km/h
tripSchema.virtual('averageSpeedKmh').get(function() {
  return this.averageSpeed;
});

// Virtual for fuel efficiency in km/L
tripSchema.virtual('fuelEfficiencyKmh').get(function() {
  return this.fuelEfficiency;
});

// Virtual for total expenses
tripSchema.virtual('totalExpenses').get(function() {
  return this.expenses.reduce((total, expense) => total + expense.amount, 0);
});

// Method to update status
tripSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  if (newStatus === 'completed' && !this.endTime) {
    this.endTime = new Date();
  }
  
  return this.save();
};

// Method to add route point
tripSchema.methods.addRoutePoint = function(coordinates, speed = null, altitude = null) {
  this.routePoints.push({
    coordinates,
    timestamp: new Date(),
    speed,
    altitude
  });
  return this.save();
};

// Method to add expense
tripSchema.methods.addExpense = function(type, amount, description = '', location = '') {
  this.expenses.push({
    type,
    amount,
    description,
    location,
    timestamp: new Date()
  });
  return this.save();
};

// Method to add note
tripSchema.methods.addNote = function(content, location = null) {
  this.notes.push({
    content,
    timestamp: new Date(),
    location
  });
  return this.save();
};

// Method to calculate fuel efficiency
tripSchema.methods.calculateFuelEfficiency = function() {
  if (this.fuelConsumption > 0 && this.distance > 0) {
    this.fuelEfficiency = this.distance / this.fuelConsumption;
  }
  return this.save();
};

// Static method to find trips by user
tripSchema.statics.findByUser = function(userId, options = {}) {
  const query = { user: userId, isArchived: false };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.dateFrom && options.dateTo) {
    query.startTime = {
      $gte: new Date(options.dateFrom),
      $lte: new Date(options.dateTo)
    };
  }
  
  return this.find(query).sort({ startTime: -1 });
};

// Static method to get trip statistics
tripSchema.statics.getTripStats = function(userId = null) {
  const match = userId ? { user: userId, isArchived: false } : { isArchived: false };
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        totalDistance: { $sum: '$distance' },
        totalDuration: { $sum: '$duration' },
        totalFuelConsumption: { $sum: '$fuelConsumption' },
        totalFuelCost: { $sum: '$fuelCost' },
        avgDistance: { $avg: '$distance' },
        avgDuration: { $avg: '$duration' },
        avgSpeed: { $avg: '$averageSpeed' },
        avgFuelEfficiency: { $avg: '$fuelEfficiency' }
      }
    }
  ]);
};

// Static method to get trips by date range
tripSchema.statics.getTripsByDateRange = function(startDate, endDate, userId = null) {
  const query = {
    startTime: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    isArchived: false
  };
  
  if (userId) {
    query.user = userId;
  }
  
  return this.find(query).sort({ startTime: -1 });
};

// Static method to get monthly trip summary
tripSchema.statics.getMonthlyTripSummary = function(year, month, userId = null) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  return this.getTripsByDateRange(startDate, endDate, userId);
};

module.exports = mongoose.model('Trip', tripSchema);
