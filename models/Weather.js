const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
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
    },
    city: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    }
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  current: {
    temperature: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      },
      feelsLike: {
        type: Number
      }
    },
    humidity: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    pressure: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        default: 'hPa'
      }
    },
    visibility: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        default: 'km'
      }
    },
    wind: {
      speed: {
        value: {
          type: Number,
          required: true
        },
        unit: {
          type: String,
          default: 'km/h'
        }
      },
      direction: {
        type: Number,
        min: 0,
        max: 360
      },
      gust: {
        value: {
          type: Number
        },
        unit: {
          type: String,
          default: 'km/h'
        }
      }
    },
    uvIndex: {
      type: Number,
      min: 0,
      max: 11
    },
    condition: {
      code: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      icon: {
        type: String
      }
    },
    precipitation: {
      value: {
        type: Number,
        default: 0
      },
      unit: {
        type: String,
        default: 'mm'
      },
      probability: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    cloudCover: {
      type: Number,
      min: 0,
      max: 100
    },
    dewPoint: {
      value: {
        type: Number
      },
      unit: {
        type: String,
        default: 'celsius'
      }
    }
  },
  forecast: [{
    date: {
      type: Date,
      required: true
    },
    temperature: {
      min: {
        type: Number,
        required: true
      },
      max: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      }
    },
    condition: {
      code: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      icon: {
        type: String
      }
    },
    precipitation: {
      value: {
        type: Number,
        default: 0
      },
      unit: {
        type: String,
        default: 'mm'
      },
      probability: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    wind: {
      speed: {
        value: {
          type: Number,
          required: true
        },
        unit: {
          type: String,
          default: 'km/h'
        }
      },
      direction: {
        type: Number,
        min: 0,
        max: 360
      }
    },
    humidity: {
      type: Number,
      min: 0,
      max: 100
    },
    uvIndex: {
      type: Number,
      min: 0,
      max: 11
    }
  }],
  alerts: [{
    type: {
      type: String,
      enum: ['weather', 'traffic', 'safety', 'emergency'],
      required: true
    },
    severity: {
      type: String,
      enum: ['low', 'moderate', 'high', 'extreme'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    affectedAreas: [{
      type: String,
      trim: true
    }],
    instructions: [{
      type: String,
      trim: true
    }],
    source: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  roadConditions: {
    surface: {
      type: String,
      enum: ['dry', 'wet', 'icy', 'snowy', 'muddy', 'unknown'],
      default: 'unknown'
    },
    visibility: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'very_poor'],
      default: 'good'
    },
    temperature: {
      value: {
        type: Number
      },
      unit: {
        type: String,
        default: 'celsius'
      }
    },
    wind: {
      speed: {
        value: {
          type: Number
        },
        unit: {
          type: String,
          default: 'km/h'
        }
      },
      direction: {
        type: Number,
        min: 0,
        max: 360
      }
    },
    precipitation: {
      type: {
        type: String,
        enum: ['none', 'rain', 'snow', 'sleet', 'hail', 'fog'],
        default: 'none'
      },
      intensity: {
        type: String,
        enum: ['none', 'light', 'moderate', 'heavy', 'extreme'],
        default: 'none'
      }
    },
    safety: {
      riskLevel: {
        type: String,
        enum: ['low', 'moderate', 'high', 'extreme'],
        default: 'low'
      },
      recommendations: [{
        type: String,
        trim: true
      }],
      warnings: [{
        type: String,
        trim: true
      }]
    }
  },
  metadata: {
    source: {
      type: String,
      required: true,
      enum: ['openweathermap', 'weatherbit', 'accuweather', 'custom']
    },
    apiKey: {
      type: String,
      trim: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    },
    version: {
      type: String,
      default: '1.0.0'
    },
    accuracy: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
weatherSchema.index({ location: '2dsphere' });
weatherSchema.index({ timestamp: -1 });
weatherSchema.index({ 'location.coordinates': 1 });
weatherSchema.index({ 'metadata.source': 1 });
weatherSchema.index({ 'metadata.expiresAt': 1 });
weatherSchema.index({ 'alerts.isActive': 1 });
weatherSchema.index({ 'alerts.severity': 1 });

// Virtual for temperature in different units
weatherSchema.virtual('temperatureFahrenheit').get(function() {
  if (this.current.temperature.unit === 'fahrenheit') {
    return this.current.temperature.value;
  }
  return (this.current.temperature.value * 9/5) + 32;
});

weatherSchema.virtual('temperatureCelsius').get(function() {
  if (this.current.temperature.unit === 'celsius') {
    return this.current.temperature.value;
  }
  return (this.current.temperature.value - 32) * 5/9;
});

// Virtual for weather condition severity
weatherSchema.virtual('conditionSeverity').get(function() {
  const condition = this.current.condition.code;
  const severeConditions = ['thunderstorm', 'heavy_rain', 'snow', 'fog'];
  return severeConditions.includes(condition) ? 'severe' : 'normal';
});

// Virtual for riding conditions
weatherSchema.virtual('ridingConditions').get(function() {
  const temp = this.current.temperature.value;
  const humidity = this.current.humidity;
  const wind = this.current.wind.speed.value;
  const precipitation = this.current.precipitation.value;
  
  let conditions = 'good';
  
  if (temp < 0 || temp > 40) conditions = 'poor';
  if (humidity > 80) conditions = 'poor';
  if (wind > 50) conditions = 'poor';
  if (precipitation > 10) conditions = 'poor';
  
  return conditions;
});

// Method to check if weather is suitable for riding
weatherSchema.methods.isSuitableForRiding = function() {
  const temp = this.current.temperature.value;
  const humidity = this.current.humidity;
  const wind = this.current.wind.speed.value;
  const precipitation = this.current.precipitation.value;
  const visibility = this.current.visibility.value;
  
  // Check temperature range
  if (temp < -10 || temp > 45) return false;
  
  // Check humidity
  if (humidity > 90) return false;
  
  // Check wind speed
  if (wind > 60) return false;
  
  // Check precipitation
  if (precipitation > 20) return false;
  
  // Check visibility
  if (visibility < 1) return false;
  
  return true;
};

// Method to get weather recommendations
weatherSchema.methods.getRecommendations = function() {
  const recommendations = [];
  const temp = this.current.temperature.value;
  const humidity = this.current.humidity;
  const wind = this.current.wind.speed.value;
  const precipitation = this.current.precipitation.value;
  
  // Temperature recommendations
  if (temp < 5) {
    recommendations.push('Wear warm clothing and consider heated gear');
  } else if (temp > 30) {
    recommendations.push('Wear light, breathable clothing and stay hydrated');
  }
  
  // Humidity recommendations
  if (humidity > 80) {
    recommendations.push('Be cautious of slippery roads and reduced visibility');
  }
  
  // Wind recommendations
  if (wind > 30) {
    recommendations.push('Be extra cautious in crosswinds and gusts');
  }
  
  // Precipitation recommendations
  if (precipitation > 0) {
    recommendations.push('Wear waterproof gear and reduce speed');
  }
  
  return recommendations;
};

// Method to check for weather alerts
weatherSchema.methods.getActiveAlerts = function() {
  const now = new Date();
  return this.alerts.filter(alert => 
    alert.isActive && 
    alert.startTime <= now && 
    alert.endTime >= now
  );
};

// Method to get weather summary
weatherSchema.methods.getWeatherSummary = function() {
  const temp = this.current.temperature.value;
  const condition = this.current.condition.description;
  const humidity = this.current.humidity;
  const wind = this.current.wind.speed.value;
  
  return {
    temperature: `${temp}°${this.current.temperature.unit === 'celsius' ? 'C' : 'F'}`,
    condition,
    humidity: `${humidity}%`,
    wind: `${wind} km/h`,
    suitableForRiding: this.isSuitableForRiding(),
    recommendations: this.getRecommendations(),
    activeAlerts: this.getActiveAlerts().length
  };
};

// Static method to get weather by location
weatherSchema.statics.getWeatherByLocation = function(coordinates, radius = 10000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: radius
      }
    }
  }).sort({ timestamp: -1 }).limit(1);
};

// Static method to get weather alerts
weatherSchema.statics.getWeatherAlerts = function(coordinates, radius = 50000) {
  const now = new Date();
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: radius
      }
    },
    'alerts.isActive': true,
    'alerts.startTime': { $lte: now },
    'alerts.endTime': { $gte: now }
  });
};

// Static method to get weather forecast
weatherSchema.statics.getWeatherForecast = function(coordinates, days = 7) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000
      }
    },
    timestamp: { $gte: startDate, $lte: endDate }
  }).sort({ timestamp: 1 });
};

// Static method to cleanup expired weather data
weatherSchema.statics.cleanupExpired = function() {
  const now = new Date();
  return this.deleteMany({
    'metadata.expiresAt': { $lt: now }
  });
};

// Static method to get weather statistics
weatherSchema.statics.getWeatherStats = function(coordinates, period = '30d') {
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
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates
            },
            $maxDistance: 10000
          }
        },
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        avgTemperature: { $avg: '$current.temperature.value' },
        avgHumidity: { $avg: '$current.humidity' },
        avgWindSpeed: { $avg: '$current.wind.speed.value' },
        totalPrecipitation: { $sum: '$current.precipitation.value' },
        maxTemperature: { $max: '$current.temperature.value' },
        minTemperature: { $min: '$current.temperature.value' }
      }
    }
  ]);
};

module.exports = mongoose.model('Weather', weatherSchema);
