const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  app: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en',
      trim: true
    },
    timezone: {
      type: String,
      default: 'UTC',
      trim: true
    },
    dateFormat: {
      type: String,
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    },
    units: {
      distance: {
        type: String,
        enum: ['km', 'miles'],
        default: 'km'
      },
      fuel: {
        type: String,
        enum: ['liters', 'gallons'],
        default: 'liters'
      },
      temperature: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      },
      speed: {
        type: String,
        enum: ['kmh', 'mph'],
        default: 'kmh'
      }
    },
    autoStart: {
      type: Boolean,
      default: false
    },
    autoEnd: {
      type: Boolean,
      default: false
    },
    backgroundTracking: {
      type: Boolean,
      default: true
    },
    batteryOptimization: {
      type: Boolean,
      default: true
    }
  },
  notifications: {
    push: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    inApp: {
      type: Boolean,
      default: true
    },
    tripUpdates: {
      type: Boolean,
      default: true
    },
    maintenanceReminders: {
      type: Boolean,
      default: true
    },
    fuelAlerts: {
      type: Boolean,
      default: true
    },
    trafficAlerts: {
      type: Boolean,
      default: true
    },
    weatherAlerts: {
      type: Boolean,
      default: true
    },
    systemAlerts: {
      type: Boolean,
      default: true
    },
    marketing: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['immediate', 'hourly', 'daily', 'weekly'],
      default: 'immediate'
    },
    quietHours: {
      enabled: {
        type: Boolean,
        default: false
      },
      start: {
        type: String,
        default: '22:00'
      },
      end: {
        type: String,
        default: '08:00'
      },
      timezone: {
        type: String,
        default: 'UTC'
      }
    }
  },
  privacy: {
    shareLocation: {
      type: Boolean,
      default: true
    },
    shareData: {
      type: Boolean,
      default: false
    },
    analytics: {
      type: Boolean,
      default: true
    },
    crashReporting: {
      type: Boolean,
      default: true
    },
    dataRetention: {
      type: Number,
      default: 365, // days
      min: 30,
      max: 2555 // 7 years
    }
  },
  map: {
    defaultZoom: {
      type: Number,
      default: 15,
      min: 1,
      max: 20
    },
    showTraffic: {
      type: Boolean,
      default: true
    },
    showGasStations: {
      type: Boolean,
      default: true
    },
    showReports: {
      type: Boolean,
      default: true
    },
    showWeather: {
      type: Boolean,
      default: true
    },
    mapType: {
      type: String,
      enum: ['roadmap', 'satellite', 'hybrid', 'terrain'],
      default: 'roadmap'
    },
    autoCenter: {
      type: Boolean,
      default: true
    },
    followUser: {
      type: Boolean,
      default: true
    },
    clustering: {
      type: Boolean,
      default: true
    }
  },
  tracking: {
    accuracy: {
      type: String,
      enum: ['low', 'balanced', 'high', 'highest'],
      default: 'balanced'
    },
    updateInterval: {
      type: Number,
      default: 5000, // milliseconds
      min: 1000,
      max: 60000
    },
    distanceThreshold: {
      type: Number,
      default: 10, // meters
      min: 1,
      max: 100
    },
    speedThreshold: {
      type: Number,
      default: 5, // km/h
      min: 1,
      max: 50
    },
    autoPause: {
      type: Boolean,
      default: true
    },
    pauseThreshold: {
      type: Number,
      default: 300, // seconds
      min: 60,
      max: 3600
    }
  },
  fuel: {
    lowFuelThreshold: {
      type: Number,
      default: 20, // percentage
      min: 5,
      max: 50
    },
    fuelEfficiency: {
      type: Number,
      default: 30, // km/liter
      min: 5,
      max: 100
    },
    fuelCapacity: {
      type: Number,
      default: 15, // liters
      min: 5,
      max: 100
    },
    autoFuelUpdate: {
      type: Boolean,
      default: false
    },
    fuelReminder: {
      type: Boolean,
      default: true
    }
  },
  maintenance: {
    reminders: {
      type: Boolean,
      default: true
    },
    intervals: {
      oilChange: {
        type: Number,
        default: 5000, // km
        min: 1000,
        max: 20000
      },
      tuneUp: {
        type: Number,
        default: 10000, // km
        min: 5000,
        max: 50000
      },
      inspection: {
        type: Number,
        default: 12000, // km
        min: 5000,
        max: 50000
      }
    },
    notifications: {
      type: Boolean,
      default: true
    },
    autoLog: {
      type: Boolean,
      default: false
    }
  },
  social: {
    shareTrips: {
      type: Boolean,
      default: false
    },
    shareAchievements: {
      type: Boolean,
      default: false
    },
    shareLocation: {
      type: Boolean,
      default: false
    },
    publicProfile: {
      type: Boolean,
      default: false
    }
  },
  advanced: {
    debugMode: {
      type: Boolean,
      default: false
    },
    logLevel: {
      type: String,
      enum: ['error', 'warn', 'info', 'debug'],
      default: 'info'
    },
    apiVersion: {
      type: String,
      default: 'v1'
    },
    experimentalFeatures: {
      type: Boolean,
      default: false
    },
    betaFeatures: {
      type: Boolean,
      default: false
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  version: {
    type: String,
    default: '1.0.0'
  }
}, {
  timestamps: true
});

// Indexes
// Note: userId index is automatically created by unique: true, so we don't need to define it again
settingsSchema.index({ 'app.theme': 1 });
settingsSchema.index({ 'app.language': 1 });
settingsSchema.index({ 'notifications.push': 1 });
settingsSchema.index({ 'privacy.shareLocation': 1 });

// Virtual for display name
settingsSchema.virtual('displayName').get(function() {
  return this.userId ? `Settings for ${this.userId}` : 'Default Settings';
});

// Method to update settings
settingsSchema.methods.updateSettings = function(updates) {
  Object.keys(updates).forEach(key => {
    if (this.schema.paths[key]) {
      this[key] = updates[key];
    }
  });
  this.lastUpdated = new Date();
  return this.save();
};

// Method to reset to defaults
settingsSchema.methods.resetToDefaults = function() {
  const defaults = this.constructor.schema.obj;
  Object.keys(defaults).forEach(key => {
    if (typeof defaults[key] === 'object' && defaults[key].default !== undefined) {
      this[key] = defaults[key].default;
    }
  });
  this.lastUpdated = new Date();
  return this.save();
};

// Method to get setting value
settingsSchema.methods.getSetting = function(path) {
  return path.split('.').reduce((obj, key) => obj && obj[key], this);
};

// Method to set setting value
settingsSchema.methods.setSetting = function(path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((obj, key) => {
    if (!obj[key]) obj[key] = {};
    return obj[key];
  }, this);
  target[lastKey] = value;
  this.lastUpdated = new Date();
  return this.save();
};

// Static method to get user settings
settingsSchema.statics.getUserSettings = function(userId) {
  return this.findOne({ userId });
};

// Static method to create default settings
settingsSchema.statics.createDefaultSettings = function(userId) {
  return this.create({ userId });
};

// Static method to update user settings
settingsSchema.statics.updateUserSettings = function(userId, updates) {
  return this.findOneAndUpdate(
    { userId },
    { $set: updates, lastUpdated: new Date() },
    { new: true, upsert: true }
  );
};

// Static method to get settings by category
settingsSchema.statics.getSettingsByCategory = function(userId, category) {
  return this.findOne({ userId }, { [category]: 1 });
};

// Static method to get all users with specific setting
settingsSchema.statics.getUsersWithSetting = function(settingPath, value) {
  const query = {};
  query[settingPath] = value;
  return this.find(query, { userId: 1 });
};

// Static method to get settings statistics
settingsSchema.statics.getSettingsStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        lightTheme: {
          $sum: { $cond: [{ $eq: ['$app.theme', 'light'] }, 1, 0] }
        },
        darkTheme: {
          $sum: { $cond: [{ $eq: ['$app.theme', 'dark'] }, 1, 0] }
        },
        autoTheme: {
          $sum: { $cond: [{ $eq: ['$app.theme', 'auto'] }, 1, 0] }
        },
        pushEnabled: {
          $sum: { $cond: ['$notifications.push', 1, 0] }
        },
        emailEnabled: {
          $sum: { $cond: ['$notifications.email', 1, 0] }
        },
        locationSharing: {
          $sum: { $cond: ['$privacy.shareLocation', 1, 0] }
        }
      }
    }
  ]);
};

// Static method to migrate settings
settingsSchema.statics.migrateSettings = function(fromVersion, toVersion) {
  // Implementation for settings migration
  // This would handle version-specific updates
  return this.updateMany(
    { version: fromVersion },
    { $set: { version: toVersion, lastUpdated: new Date() } }
  );
};

// Pre-save middleware
settingsSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Post-save middleware
settingsSchema.post('save', function(doc) {
  // Emit event or trigger other actions
  console.log(`Settings updated for user ${doc.userId}`);
});

module.exports = mongoose.model('Settings', settingsSchema);
