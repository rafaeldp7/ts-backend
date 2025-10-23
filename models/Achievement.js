const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
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
  category: {
    type: String,
    required: true,
    enum: [
      'distance',
      'speed',
      'safety',
      'efficiency',
      'social',
      'exploration',
      'maintenance',
      'environmental',
      'streak',
      'milestone',
      'special'
    ]
  },
  type: {
    type: String,
    required: true,
    enum: [
      'single',
      'cumulative',
      'streak',
      'conditional',
      'time_based',
      'distance_based',
      'social',
      'hidden'
    ]
  },
  icon: {
    type: String,
    required: true,
    trim: true
  },
  badge: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#FFD700',
    trim: true
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  points: {
    type: Number,
    default: 10,
    min: 0
  },
  requirements: {
    distance: {
      value: {
        type: Number,
        min: 0
      },
      unit: {
        type: String,
        enum: ['km', 'miles'],
        default: 'km'
      }
    },
    speed: {
      value: {
        type: Number,
        min: 0
      },
      unit: {
        type: String,
        enum: ['km/h', 'mph'],
        default: 'km/h'
      }
    },
    trips: {
      type: Number,
      min: 0
    },
    days: {
      type: Number,
      min: 0
    },
    hours: {
      type: Number,
      min: 0
    },
    fuelEfficiency: {
      value: {
        type: Number,
        min: 0
      },
      unit: {
        type: String,
        enum: ['km/l', 'mpg'],
        default: 'km/l'
      }
    },
    safetyScore: {
      type: Number,
      min: 0,
      max: 100
    },
    conditions: [{
      type: String,
      enum: [
        'rain',
        'snow',
        'night',
        'highway',
        'city',
        'mountain',
        'coastal',
        'desert',
        'urban',
        'rural'
      ]
    }],
    timeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night']
    },
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    season: {
      type: String,
      enum: ['spring', 'summer', 'autumn', 'winter']
    },
    weather: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'snowy', 'foggy', 'windy']
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function(coords) {
            return coords.length === 2 && 
                   coords[0] >= -180 && coords[0] <= 180 && 
                   coords[1] >= -90 && coords[1] <= 90;
          },
          message: 'Invalid coordinates'
        }
      },
      radius: {
        type: Number,
        min: 0
      }
    },
    social: {
      shareTrips: {
        type: Number,
        min: 0
      },
      inviteFriends: {
        type: Number,
        min: 0
      },
      communityContributions: {
        type: Number,
        min: 0
      }
    },
    maintenance: {
      oilChanges: {
        type: Number,
        min: 0
      },
      tuneUps: {
        type: Number,
        min: 0
      },
      inspections: {
        type: Number,
        min: 0
      }
    },
    environmental: {
      carbonSaved: {
        value: {
          type: Number,
          min: 0
        },
        unit: {
          type: String,
          default: 'kg'
        }
      },
      greenTrips: {
        type: Number,
        min: 0
      }
    }
  },
  rewards: {
    points: {
      type: Number,
      default: 0,
      min: 0
    },
    badge: {
      type: String,
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    discount: {
      type: Number,
      min: 0,
      max: 100
    },
    unlockFeature: {
      type: String,
      trim: true
    },
    customReward: {
      type: String,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  isRepeatable: {
    type: Boolean,
    default: false
  },
  maxCompletions: {
    type: Number,
    default: 1,
    min: 1
  },
  cooldownPeriod: {
    type: Number,
    default: 0,
    min: 0
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    createdBy: {
      type: String,
      enum: ['system', 'admin', 'user'],
      default: 'system'
    },
    version: {
      type: String,
      default: '1.0.0'
    },
    lastModified: {
      type: Date,
      default: Date.now
    },
    source: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
achievementSchema.index({ name: 1 });
achievementSchema.index({ category: 1 });
achievementSchema.index({ type: 1 });
achievementSchema.index({ rarity: 1 });
achievementSchema.index({ isActive: 1 });
achievementSchema.index({ isHidden: 1 });
achievementSchema.index({ points: -1 });
achievementSchema.index({ tags: 1 });
achievementSchema.index({ 'requirements.location.coordinates': '2dsphere' });

// Virtual for difficulty level
achievementSchema.virtual('difficulty').get(function() {
  const { distance, speed, trips, days, hours } = this.requirements;
  let difficulty = 0;
  
  if (distance && distance.value > 1000) difficulty += 2;
  if (speed && speed.value > 100) difficulty += 2;
  if (trips && trips > 50) difficulty += 2;
  if (days && days > 30) difficulty += 2;
  if (hours && hours > 100) difficulty += 2;
  
  if (difficulty >= 8) return 'extreme';
  if (difficulty >= 6) return 'hard';
  if (difficulty >= 4) return 'medium';
  if (difficulty >= 2) return 'easy';
  return 'very_easy';
});

// Virtual for completion rate
achievementSchema.virtual('completionRate').get(function() {
  // This would be calculated from user achievements
  return 0;
});

// Method to check if requirements are met
achievementSchema.methods.checkRequirements = function(userData) {
  const { distance, speed, trips, days, hours, fuelEfficiency, safetyScore, conditions, timeOfDay, dayOfWeek, season, weather, location, social, maintenance, environmental } = this.requirements;
  
  // Check distance requirement
  if (distance && userData.totalDistance < distance.value) return false;
  
  // Check speed requirement
  if (speed && userData.maxSpeed < speed.value) return false;
  
  // Check trips requirement
  if (trips && userData.totalTrips < trips) return false;
  
  // Check days requirement
  if (days && userData.activeDays < days) return false;
  
  // Check hours requirement
  if (hours && userData.activeHours < hours) return false;
  
  // Check fuel efficiency requirement
  if (fuelEfficiency && userData.averageFuelEfficiency < fuelEfficiency.value) return false;
  
  // Check safety score requirement
  if (safetyScore && userData.safetyScore < safetyScore) return false;
  
  // Check conditions requirement
  if (conditions && conditions.length > 0) {
    const hasRequiredConditions = conditions.every(condition => 
      userData.conditions && userData.conditions.includes(condition)
    );
    if (!hasRequiredConditions) return false;
  }
  
  // Check time of day requirement
  if (timeOfDay && userData.timeOfDay !== timeOfDay) return false;
  
  // Check day of week requirement
  if (dayOfWeek && userData.dayOfWeek !== dayOfWeek) return false;
  
  // Check season requirement
  if (season && userData.season !== season) return false;
  
  // Check weather requirement
  if (weather && userData.weather !== weather) return false;
  
  // Check location requirement
  if (location && location.coordinates) {
    const userLocation = userData.location;
    if (!userLocation) return false;
    
    const distance = this.calculateDistance(
      userLocation.coordinates,
      location.coordinates
    );
    
    if (distance > (location.radius || 1000)) return false;
  }
  
  // Check social requirements
  if (social) {
    if (social.shareTrips && userData.sharedTrips < social.shareTrips) return false;
    if (social.inviteFriends && userData.invitedFriends < social.inviteFriends) return false;
    if (social.communityContributions && userData.communityContributions < social.communityContributions) return false;
  }
  
  // Check maintenance requirements
  if (maintenance) {
    if (maintenance.oilChanges && userData.oilChanges < maintenance.oilChanges) return false;
    if (maintenance.tuneUps && userData.tuneUps < maintenance.tuneUps) return false;
    if (maintenance.inspections && userData.inspections < maintenance.inspections) return false;
  }
  
  // Check environmental requirements
  if (environmental) {
    if (environmental.carbonSaved && userData.carbonSaved < environmental.carbonSaved.value) return false;
    if (environmental.greenTrips && userData.greenTrips < environmental.greenTrips) return false;
  }
  
  return true;
};

// Method to calculate distance between two points
achievementSchema.methods.calculateDistance = function(coord1, coord2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
  const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Method to get achievement summary
achievementSchema.methods.getSummary = function() {
  return {
    name: this.name,
    description: this.description,
    category: this.category,
    type: this.type,
    rarity: this.rarity,
    points: this.points,
    difficulty: this.difficulty,
    isActive: this.isActive,
    isHidden: this.isHidden,
    isRepeatable: this.isRepeatable,
    rewards: this.rewards
  };
};

// Static method to get achievements by category
achievementSchema.statics.getAchievementsByCategory = function(category, options = {}) {
  const {
    limit = 20,
    page = 1,
    sortBy = 'points',
    sortOrder = 'desc',
    rarity = null
  } = options;

  const filter = { category, isActive: true };
  if (rarity) filter.rarity = rarity;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(filter)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get achievements by type
achievementSchema.statics.getAchievementsByType = function(type, options = {}) {
  const {
    limit = 20,
    page = 1,
    sortBy = 'points',
    sortOrder = 'desc'
  } = options;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find({ type, isActive: true })
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get achievements by rarity
achievementSchema.statics.getAchievementsByRarity = function(rarity, options = {}) {
  const {
    limit = 20,
    page = 1,
    sortBy = 'points',
    sortOrder = 'desc'
  } = options;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find({ rarity, isActive: true })
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to search achievements
achievementSchema.statics.searchAchievements = function(query, options = {}) {
  const {
    limit = 20,
    page = 1,
    sortBy = 'points',
    sortOrder = 'desc',
    category = null,
    type = null,
    rarity = null
  } = options;

  const filter = {
    isActive: true,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  };

  if (category) filter.category = category;
  if (type) filter.type = type;
  if (rarity) filter.rarity = rarity;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(filter)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get achievement statistics
achievementSchema.statics.getAchievementStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalAchievements: { $sum: 1 },
        activeAchievements: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        hiddenAchievements: {
          $sum: { $cond: ['$isHidden', 1, 0] }
        },
        repeatableAchievements: {
          $sum: { $cond: ['$isRepeatable', 1, 0] }
        },
        commonAchievements: {
          $sum: { $cond: [{ $eq: ['$rarity', 'common'] }, 1, 0] }
        },
        uncommonAchievements: {
          $sum: { $cond: [{ $eq: ['$rarity', 'uncommon'] }, 1, 0] }
        },
        rareAchievements: {
          $sum: { $cond: [{ $eq: ['$rarity', 'rare'] }, 1, 0] }
        },
        epicAchievements: {
          $sum: { $cond: [{ $eq: ['$rarity', 'epic'] }, 1, 0] }
        },
        legendaryAchievements: {
          $sum: { $cond: [{ $eq: ['$rarity', 'legendary'] }, 1, 0] }
        },
        totalPoints: { $sum: '$points' },
        avgPoints: { $avg: '$points' }
      }
    }
  ]);
};

// Static method to get achievements by difficulty
achievementSchema.statics.getAchievementsByDifficulty = function(difficulty, options = {}) {
  const {
    limit = 20,
    page = 1,
    sortBy = 'points',
    sortOrder = 'desc'
  } = options;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find({ isActive: true })
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .then(achievements => {
      return achievements.filter(achievement => 
        achievement.difficulty === difficulty
      );
    });
};

// Static method to get random achievement
achievementSchema.statics.getRandomAchievement = function(category = null, rarity = null) {
  const filter = { isActive: true };
  if (category) filter.category = category;
  if (rarity) filter.rarity = rarity;

  return this.aggregate([
    { $match: filter },
    { $sample: { size: 1 } }
  ]);
};

// Static method to get achievement leaderboard
achievementSchema.statics.getAchievementLeaderboard = function(options = {}) {
  const {
    limit = 20,
    sortBy = 'points',
    sortOrder = 'desc'
  } = options;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find({ isActive: true })
    .sort(sortOptions)
    .limit(limit);
};

module.exports = mongoose.model('Achievement', achievementSchema);
