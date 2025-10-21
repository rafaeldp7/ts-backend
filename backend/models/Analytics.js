const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  motorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Motor'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'trip',
      'fuel',
      'maintenance',
      'performance',
      'safety',
      'efficiency',
      'usage',
      'cost',
      'environmental',
      'social',
      'custom'
    ]
  },
  period: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  metrics: {
    // Trip metrics
    totalTrips: {
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
    maxSpeed: {
      type: Number,
      default: 0
    },
    totalElevation: {
      type: Number,
      default: 0
    },
    
    // Fuel metrics
    totalFuelUsed: {
      type: Number,
      default: 0
    },
    averageFuelEfficiency: {
      type: Number,
      default: 0
    },
    fuelCost: {
      type: Number,
      default: 0
    },
    fuelStops: {
      type: Number,
      default: 0
    },
    
    // Performance metrics
    accelerationEvents: {
      type: Number,
      default: 0
    },
    brakingEvents: {
      type: Number,
      default: 0
    },
    corneringEvents: {
      type: Number,
      default: 0
    },
    speedViolations: {
      type: Number,
      default: 0
    },
    
    // Safety metrics
    safetyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    riskEvents: {
      type: Number,
      default: 0
    },
    nearMisses: {
      type: Number,
      default: 0
    },
    emergencyStops: {
      type: Number,
      default: 0
    },
    
    // Efficiency metrics
    efficiencyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    idleTime: {
      type: Number,
      default: 0
    },
    stopTime: {
      type: Number,
      default: 0
    },
    trafficDelays: {
      type: Number,
      default: 0
    },
    
    // Usage metrics
    activeDays: {
      type: Number,
      default: 0
    },
    activeHours: {
      type: Number,
      default: 0
    },
    peakHours: {
      type: [Number],
      default: []
    },
    peakDays: {
      type: [String],
      default: []
    },
    
    // Cost metrics
    totalCost: {
      type: Number,
      default: 0
    },
    fuelCost: {
      type: Number,
      default: 0
    },
    maintenanceCost: {
      type: Number,
      default: 0
    },
    insuranceCost: {
      type: Number,
      default: 0
    },
    
    // Environmental metrics
    carbonFootprint: {
      type: Number,
      default: 0
    },
    emissionsSaved: {
      type: Number,
      default: 0
    },
    greenTrips: {
      type: Number,
      default: 0
    },
    
    // Social metrics
    sharedTrips: {
      type: Number,
      default: 0
    },
    socialScore: {
      type: Number,
      default: 0
    },
    communityContributions: {
      type: Number,
      default: 0
    }
  },
  trends: {
    distanceTrend: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable'],
      default: 'stable'
    },
    speedTrend: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable'],
      default: 'stable'
    },
    efficiencyTrend: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable'],
      default: 'stable'
    },
    safetyTrend: {
      type: String,
      enum: ['improving', 'declining', 'stable'],
      default: 'stable'
    },
    costTrend: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable'],
      default: 'stable'
    }
  },
  insights: [{
    type: {
      type: String,
      enum: ['tip', 'warning', 'achievement', 'recommendation', 'alert']
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    actionable: {
      type: Boolean,
      default: false
    },
    actionUrl: {
      type: String
    },
    actionText: {
      type: String
    }
  }],
  comparisons: {
    previousPeriod: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    average: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    benchmark: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  metadata: {
    generatedAt: {
      type: Date,
      default: Date.now
    },
    generatedBy: {
      type: String,
      enum: ['system', 'user', 'scheduled'],
      default: 'system'
    },
    version: {
      type: String,
      default: '1.0.0'
    },
    source: {
      type: String,
      default: 'app'
    },
    tags: [{
      type: String,
      trim: true
    }]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
analyticsSchema.index({ userId: 1 });
analyticsSchema.index({ motorId: 1 });
analyticsSchema.index({ type: 1 });
analyticsSchema.index({ period: 1 });
analyticsSchema.index({ startDate: 1, endDate: 1 });
analyticsSchema.index({ userId: 1, type: 1 });
analyticsSchema.index({ userId: 1, period: 1 });
analyticsSchema.index({ userId: 1, startDate: 1, endDate: 1 });

// Virtual for period duration
analyticsSchema.virtual('duration').get(function() {
  return this.endDate - this.startDate;
});

// Virtual for period label
analyticsSchema.virtual('periodLabel').get(function() {
  const start = this.startDate.toLocaleDateString();
  const end = this.endDate.toLocaleDateString();
  return `${start} - ${end}`;
});

// Method to calculate efficiency score
analyticsSchema.methods.calculateEfficiencyScore = function() {
  const { totalDistance, totalFuelUsed, totalDuration } = this.metrics;
  
  if (totalDistance === 0 || totalFuelUsed === 0) return 0;
  
  const fuelEfficiency = totalDistance / totalFuelUsed;
  const timeEfficiency = totalDistance / (totalDuration / 60); // km/h
  
  // Normalize scores (0-100)
  const fuelScore = Math.min(fuelEfficiency / 50 * 100, 100);
  const timeScore = Math.min(timeEfficiency / 100 * 100, 100);
  
  return Math.round((fuelScore + timeScore) / 2);
};

// Method to calculate safety score
analyticsSchema.methods.calculateSafetyScore = function() {
  const { speedViolations, riskEvents, emergencyStops, totalTrips } = this.metrics;
  
  if (totalTrips === 0) return 100;
  
  const violationRate = speedViolations / totalTrips;
  const riskRate = riskEvents / totalTrips;
  const emergencyRate = emergencyStops / totalTrips;
  
  // Calculate penalty scores
  const violationPenalty = Math.min(violationRate * 20, 50);
  const riskPenalty = Math.min(riskRate * 30, 40);
  const emergencyPenalty = Math.min(emergencyRate * 40, 30);
  
  const totalPenalty = violationPenalty + riskPenalty + emergencyPenalty;
  
  return Math.max(100 - totalPenalty, 0);
};

// Method to generate insights
analyticsSchema.methods.generateInsights = function() {
  const insights = [];
  const { metrics, trends } = this;
  
  // Fuel efficiency insights
  if (metrics.averageFuelEfficiency < 20) {
    insights.push({
      type: 'warning',
      title: 'Low Fuel Efficiency',
      message: 'Your fuel efficiency is below average. Consider checking your riding habits.',
      priority: 'high',
      actionable: true,
      actionText: 'View Tips'
    });
  }
  
  // Safety insights
  if (metrics.speedViolations > 5) {
    insights.push({
      type: 'warning',
      title: 'Speed Violations',
      message: 'You have multiple speed violations. Please ride more safely.',
      priority: 'high',
      actionable: true,
      actionText: 'View Safety Tips'
    });
  }
  
  // Achievement insights
  if (metrics.totalDistance > 1000) {
    insights.push({
      type: 'achievement',
      title: 'Distance Milestone',
      message: `Congratulations! You've traveled ${metrics.totalDistance}km this period.`,
      priority: 'low',
      actionable: false
    });
  }
  
  // Trend insights
  if (trends.efficiencyTrend === 'improving') {
    insights.push({
      type: 'tip',
      title: 'Efficiency Improving',
      message: 'Great job! Your fuel efficiency is getting better.',
      priority: 'low',
      actionable: false
    });
  }
  
  return insights;
};

// Static method to generate analytics
analyticsSchema.statics.generateAnalytics = function(userId, motorId, type, period, startDate, endDate) {
  // This would typically aggregate data from other collections
  // For now, return a basic analytics object
  return this.create({
    userId,
    motorId,
    type,
    period,
    startDate,
    endDate,
    metrics: {
      totalTrips: 0,
      totalDistance: 0,
      totalDuration: 0,
      averageSpeed: 0,
      totalFuelUsed: 0,
      averageFuelEfficiency: 0,
      safetyScore: 0,
      efficiencyScore: 0
    },
    trends: {
      distanceTrend: 'stable',
      speedTrend: 'stable',
      efficiencyTrend: 'stable',
      safetyTrend: 'stable',
      costTrend: 'stable'
    },
    insights: [],
    comparisons: {},
    metadata: {
      generatedAt: new Date(),
      generatedBy: 'system',
      version: '1.0.0',
      source: 'app'
    }
  });
};

// Static method to get analytics summary
analyticsSchema.statics.getAnalyticsSummary = function(userId, period = '30d') {
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
        startDate: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalAnalytics: { $sum: 1 },
        avgSafetyScore: { $avg: '$metrics.safetyScore' },
        avgEfficiencyScore: { $avg: '$metrics.efficiencyScore' },
        totalDistance: { $sum: '$metrics.totalDistance' },
        totalFuelUsed: { $sum: '$metrics.totalFuelUsed' },
        totalTrips: { $sum: '$metrics.totalTrips' }
      }
    }
  ]);
};

// Static method to get analytics by type
analyticsSchema.statics.getAnalyticsByType = function(userId, type, options = {}) {
  const {
    limit = 20,
    page = 1,
    sortBy = 'startDate',
    sortOrder = 'desc'
  } = options;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find({ userId, type })
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get analytics trends
analyticsSchema.statics.getAnalyticsTrends = function(userId, type, period = '30d') {
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

  return this.find({
    userId,
    type,
    startDate: { $gte: startDate }
  }).sort({ startDate: 1 });
};

// Static method to get analytics insights
analyticsSchema.statics.getAnalyticsInsights = function(userId, priority = null) {
  const match = { userId };
  if (priority) match['insights.priority'] = priority;

  return this.aggregate([
    { $match: match },
    { $unwind: '$insights' },
    { $sort: { 'insights.priority': 1, createdAt: -1 } },
    { $limit: 50 }
  ]);
};

// Static method to cleanup old analytics
analyticsSchema.statics.cleanupOldAnalytics = function(daysToKeep = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate }
  });
};

module.exports = mongoose.model('Analytics', analyticsSchema);
