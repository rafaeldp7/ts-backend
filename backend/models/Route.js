const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  motorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Motor'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  startLocation: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
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
      }
    }
  },
  endLocation: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
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
      }
    }
  },
  waypoints: [{
    address: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
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
      }
    },
    order: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  route: {
    polyline: {
      type: String,
      required: true
    },
    distance: {
      value: {
        type: Number,
        required: true,
        min: 0
      },
      unit: {
        type: String,
        default: 'km'
      }
    },
    duration: {
      value: {
        type: Number,
        required: true,
        min: 0
      },
      unit: {
        type: String,
        default: 'minutes'
      }
    },
    elevation: {
      gain: {
        type: Number,
        default: 0
      },
      loss: {
        type: Number,
        default: 0
      },
      unit: {
        type: String,
        default: 'm'
      }
    },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'hard', 'expert'],
      default: 'moderate'
    },
    surface: {
      type: String,
      enum: ['paved', 'unpaved', 'mixed', 'unknown'],
      default: 'unknown'
    },
    traffic: {
      type: String,
      enum: ['light', 'moderate', 'heavy', 'unknown'],
      default: 'unknown'
    }
  },
  preferences: {
    avoidHighways: {
      type: Boolean,
      default: false
    },
    avoidTolls: {
      type: Boolean,
      default: false
    },
    avoidFerries: {
      type: Boolean,
      default: false
    },
    avoidTunnels: {
      type: Boolean,
      default: false
    },
    avoidBridges: {
      type: Boolean,
      default: false
    },
    preferScenic: {
      type: Boolean,
      default: false
    },
    preferFast: {
      type: Boolean,
      default: false
    },
    preferSafe: {
      type: Boolean,
      default: false
    }
  },
  statistics: {
    timesUsed: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    totalDistance: {
      type: Number,
      default: 0
    },
    totalDuration: {
      type: Number,
      default: 0
    },
    averageSpeed: {
      type: Number,
      default: 0
    },
    fuelEfficiency: {
      type: Number,
      default: 0
    },
    safetyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    createdBy: {
      type: String,
      enum: ['user', 'system', 'imported'],
      default: 'user'
    },
    source: {
      type: String,
      trim: true
    },
    version: {
      type: String,
      default: '1.0.0'
    },
    lastModified: {
      type: Date,
      default: Date.now
    },
    checksum: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
routeSchema.index({ userId: 1 });
routeSchema.index({ motorId: 1 });
routeSchema.index({ name: 1 });
routeSchema.index({ isPublic: 1 });
routeSchema.index({ isFavorite: 1 });
routeSchema.index({ isActive: 1 });
routeSchema.index({ 'startLocation.coordinates': '2dsphere' });
routeSchema.index({ 'endLocation.coordinates': '2dsphere' });
routeSchema.index({ 'statistics.timesUsed': -1 });
routeSchema.index({ 'statistics.averageRating': -1 });
routeSchema.index({ tags: 1 });
routeSchema.index({ userId: 1, isFavorite: 1 });
routeSchema.index({ userId: 1, isActive: 1 });

// Virtual for route summary
routeSchema.virtual('routeSummary').get(function() {
  return {
    name: this.name,
    distance: `${this.route.distance.value} ${this.route.distance.unit}`,
    duration: `${this.route.duration.value} ${this.route.duration.unit}`,
    difficulty: this.route.difficulty,
    timesUsed: this.statistics.timesUsed,
    averageRating: this.statistics.averageRating
  };
});

// Virtual for route efficiency
routeSchema.virtual('efficiency').get(function() {
  if (this.route.distance.value === 0) return 0;
  return this.route.duration.value / this.route.distance.value;
});

// Method to calculate route statistics
routeSchema.methods.calculateStatistics = function() {
  // This would typically aggregate data from trip records
  // For now, return basic statistics
  return {
    timesUsed: this.statistics.timesUsed,
    averageRating: this.statistics.averageRating,
    totalDistance: this.statistics.totalDistance,
    totalDuration: this.statistics.totalDuration,
    averageSpeed: this.statistics.averageSpeed,
    fuelEfficiency: this.statistics.fuelEfficiency,
    safetyScore: this.statistics.safetyScore
  };
};

// Method to update route usage
routeSchema.methods.updateUsage = function(tripData) {
  this.statistics.timesUsed += 1;
  this.statistics.lastUsed = new Date();
  
  if (tripData.distance) {
    this.statistics.totalDistance += tripData.distance;
  }
  
  if (tripData.duration) {
    this.statistics.totalDuration += tripData.duration;
  }
  
  if (tripData.speed) {
    this.statistics.averageSpeed = 
      (this.statistics.averageSpeed * (this.statistics.timesUsed - 1) + tripData.speed) / 
      this.statistics.timesUsed;
  }
  
  return this.save();
};

// Method to rate route
routeSchema.methods.rateRoute = function(rating) {
  if (rating < 0 || rating > 5) {
    throw new Error('Rating must be between 0 and 5');
  }
  
  const totalRatings = this.statistics.totalRatings;
  const currentAverage = this.statistics.averageRating;
  
  this.statistics.totalRatings += 1;
  this.statistics.averageRating = 
    (currentAverage * totalRatings + rating) / (totalRatings + 1);
  
  return this.save();
};

// Method to check if route is nearby
routeSchema.methods.isNearby = function(coordinates, radius = 1000) {
  const startCoords = this.startLocation.coordinates.coordinates;
  const endCoords = this.endLocation.coordinates.coordinates;
  
  // Calculate distance using Haversine formula
  const distanceToStart = this.calculateDistance(coordinates, startCoords);
  const distanceToEnd = this.calculateDistance(coordinates, endCoords);
  
  return distanceToStart <= radius || distanceToEnd <= radius;
};

// Method to calculate distance between two points
routeSchema.methods.calculateDistance = function(coord1, coord2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
  const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Method to get route directions
routeSchema.methods.getDirections = function() {
  return {
    start: this.startLocation,
    end: this.endLocation,
    waypoints: this.waypoints.sort((a, b) => a.order - b.order),
    polyline: this.route.polyline,
    distance: this.route.distance,
    duration: this.route.duration,
    elevation: this.route.elevation
  };
};

// Method to duplicate route
routeSchema.methods.duplicate = function(newName) {
  const duplicate = new this.constructor({
    userId: this.userId,
    motorId: this.motorId,
    name: newName || `${this.name} (Copy)`,
    description: this.description,
    startLocation: this.startLocation,
    endLocation: this.endLocation,
    waypoints: this.waypoints,
    route: this.route,
    preferences: this.preferences,
    tags: this.tags,
    isPublic: false,
    isFavorite: false,
    isActive: true,
    metadata: {
      createdBy: 'user',
      source: 'duplicate',
      version: '1.0.0',
      lastModified: new Date()
    }
  });
  
  return duplicate.save();
};

// Static method to get routes by user
routeSchema.statics.getRoutesByUser = function(userId, options = {}) {
  const {
    limit = 20,
    page = 1,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    isFavorite = null,
    isActive = true
  } = options;

  const filter = { userId, isActive };
  if (isFavorite !== null) filter.isFavorite = isFavorite;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(filter)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get nearby routes
routeSchema.statics.getNearbyRoutes = function(coordinates, radius = 5000, options = {}) {
  const {
    limit = 20,
    sortBy = 'statistics.timesUsed',
    sortOrder = 'desc'
  } = options;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find({
    'startLocation.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: radius
      }
    },
    isPublic: true,
    isActive: true
  })
  .sort(sortOptions)
  .limit(limit);
};

// Static method to get popular routes
routeSchema.statics.getPopularRoutes = function(options = {}) {
  const {
    limit = 20,
    minRating = 3,
    minUsage = 5
  } = options;

  return this.find({
    isPublic: true,
    isActive: true,
    'statistics.averageRating': { $gte: minRating },
    'statistics.timesUsed': { $gte: minUsage }
  })
  .sort({ 'statistics.timesUsed': -1, 'statistics.averageRating': -1 })
  .limit(limit);
};

// Static method to search routes
routeSchema.statics.searchRoutes = function(query, options = {}) {
  const {
    limit = 20,
    page = 1,
    sortBy = 'statistics.timesUsed',
    sortOrder = 'desc',
    tags = [],
    difficulty = null,
    surface = null
  } = options;

  const filter = {
    isPublic: true,
    isActive: true,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { 'startLocation.address': { $regex: query, $options: 'i' } },
      { 'endLocation.address': { $regex: query, $options: 'i' } }
    ]
  };

  if (tags.length > 0) {
    filter.tags = { $in: tags };
  }

  if (difficulty) {
    filter['route.difficulty'] = difficulty;
  }

  if (surface) {
    filter['route.surface'] = surface;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(filter)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get route statistics
routeSchema.statics.getRouteStats = function(userId) {
  return this.aggregate([
    { $match: { userId, isActive: true } },
    {
      $group: {
        _id: null,
        totalRoutes: { $sum: 1 },
        favoriteRoutes: { $sum: { $cond: ['$isFavorite', 1, 0] } },
        publicRoutes: { $sum: { $cond: ['$isPublic', 1, 0] } },
        totalDistance: { $sum: '$route.distance.value' },
        totalDuration: { $sum: '$route.duration.value' },
        avgRating: { $avg: '$statistics.averageRating' },
        totalUsage: { $sum: '$statistics.timesUsed' }
      }
    }
  ]);
};

// Static method to cleanup inactive routes
routeSchema.statics.cleanupInactiveRoutes = function(daysToKeep = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  return this.deleteMany({
    isActive: false,
    updatedAt: { $lt: cutoffDate }
  });
};

module.exports = mongoose.model('Route', routeSchema);
