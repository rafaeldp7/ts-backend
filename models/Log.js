const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ['error', 'warn', 'info', 'debug', 'trace']
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'auth',
      'api',
      'database',
      'security',
      'performance',
      'error',
      'user_action',
      'system',
      'third_party',
      'payment',
      'notification',
      'email',
      'sms',
      'push',
      'analytics',
      'tracking',
      'maintenance',
      'backup',
      'sync',
      'other'
    ]
  },
  source: {
    type: String,
    required: true,
    enum: ['frontend', 'backend', 'mobile', 'web', 'api', 'system', 'third_party']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String,
    trim: true
  },
  requestId: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  deviceInfo: {
    platform: {
      type: String,
      enum: ['ios', 'android', 'web', 'desktop']
    },
    osVersion: {
      type: String,
      trim: true
    },
    appVersion: {
      type: String,
      trim: true
    },
    deviceModel: {
      type: String,
      trim: true
    },
    screenSize: {
      type: String,
      trim: true
    }
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
    address: {
      type: String,
      trim: true
    }
  },
  context: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  stack: {
    type: String,
    trim: true
  },
  error: {
    name: {
      type: String,
      trim: true
    },
    message: {
      type: String,
      trim: true
    },
    code: {
      type: String,
      trim: true
    },
    statusCode: {
      type: Number
    },
    stack: {
      type: String,
      trim: true
    }
  },
  performance: {
    duration: {
      type: Number,
      min: 0
    },
    memoryUsage: {
      type: Number,
      min: 0
    },
    cpuUsage: {
      type: Number,
      min: 0,
      max: 100
    },
    responseTime: {
      type: Number,
      min: 0
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: {
    type: String,
    trim: true,
    maxlength: 500
  },
  metadata: {
    version: {
      type: String,
      trim: true
    },
    environment: {
      type: String,
      enum: ['development', 'staging', 'production', 'test'],
      default: 'production'
    },
    service: {
      type: String,
      trim: true
    },
    module: {
      type: String,
      trim: true
    },
    function: {
      type: String,
      trim: true
    },
    line: {
      type: Number
    },
    file: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
logSchema.index({ level: 1 });
logSchema.index({ category: 1 });
logSchema.index({ source: 1 });
logSchema.index({ userId: 1 });
logSchema.index({ sessionId: 1 });
logSchema.index({ requestId: 1 });
logSchema.index({ createdAt: -1 });
logSchema.index({ isResolved: 1 });
logSchema.index({ 'location.coordinates': '2dsphere' });
logSchema.index({ level: 1, category: 1 });
logSchema.index({ userId: 1, createdAt: -1 });
logSchema.index({ source: 1, level: 1 });
logSchema.index({ 'metadata.environment': 1, level: 1 });

// Virtual for time since creation
logSchema.virtual('timeSinceCreated').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Virtual for severity level
logSchema.virtual('severity').get(function() {
  const severityMap = {
    'error': 5,
    'warn': 4,
    'info': 3,
    'debug': 2,
    'trace': 1
  };
  return severityMap[this.level] || 0;
});

// Method to resolve log
logSchema.methods.resolve = function(resolvedBy, resolution) {
  this.isResolved = true;
  this.resolvedAt = new Date();
  this.resolvedBy = resolvedBy;
  this.resolution = resolution;
  return this.save();
};

// Method to get log summary
logSchema.methods.getSummary = function() {
  return {
    level: this.level,
    message: this.message,
    category: this.category,
    source: this.source,
    userId: this.userId,
    createdAt: this.createdAt,
    isResolved: this.isResolved,
    severity: this.severity
  };
};

// Method to get error details
logSchema.methods.getErrorDetails = function() {
  if (this.level !== 'error' || !this.error) return null;
  
  return {
    name: this.error.name,
    message: this.error.message,
    code: this.error.code,
    statusCode: this.error.statusCode,
    stack: this.error.stack
  };
};

// Method to get performance details
logSchema.methods.getPerformanceDetails = function() {
  if (!this.performance) return null;
  
  return {
    duration: this.performance.duration,
    memoryUsage: this.performance.memoryUsage,
    cpuUsage: this.performance.cpuUsage,
    responseTime: this.performance.responseTime
  };
};

// Static method to get logs by level
logSchema.statics.getLogsByLevel = function(level, options = {}) {
  const {
    limit = 100,
    page = 1,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    startDate = null,
    endDate = null
  } = options;

  const filter = { level };
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(filter)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get logs by category
logSchema.statics.getLogsByCategory = function(category, options = {}) {
  const {
    limit = 100,
    page = 1,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    level = null
  } = options;

  const filter = { category };
  if (level) filter.level = level;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(filter)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get logs by user
logSchema.statics.getLogsByUser = function(userId, options = {}) {
  const {
    limit = 100,
    page = 1,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    level = null,
    category = null
  } = options;

  const filter = { userId };
  if (level) filter.level = level;
  if (category) filter.category = category;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(filter)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get error logs
logSchema.statics.getErrorLogs = function(options = {}) {
  const {
    limit = 100,
    page = 1,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    startDate = null,
    endDate = null,
    isResolved = null
  } = options;

  const filter = { level: 'error' };
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  if (isResolved !== null) filter.isResolved = isResolved;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(filter)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get log statistics
logSchema.statics.getLogStats = function(period = '24h') {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case '1h':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalLogs: { $sum: 1 },
        errorLogs: {
          $sum: { $cond: [{ $eq: ['$level', 'error'] }, 1, 0] }
        },
        warnLogs: {
          $sum: { $cond: [{ $eq: ['$level', 'warn'] }, 1, 0] }
        },
        infoLogs: {
          $sum: { $cond: [{ $eq: ['$level', 'info'] }, 1, 0] }
        },
        debugLogs: {
          $sum: { $cond: [{ $eq: ['$level', 'debug'] }, 1, 0] }
        },
        traceLogs: {
          $sum: { $cond: [{ $eq: ['$level', 'trace'] }, 1, 0] }
        },
        resolvedLogs: {
          $sum: { $cond: ['$isResolved', 1, 0] }
        },
        unresolvedLogs: {
          $sum: { $cond: [{ $eq: ['$isResolved', false] }, 1, 0] }
        }
      }
    }
  ]);
};

// Static method to get log trends
logSchema.statics.getLogTrends = function(period = '24h') {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case '1h':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        },
        totalLogs: { $sum: 1 },
        errorLogs: {
          $sum: { $cond: [{ $eq: ['$level', 'error'] }, 1, 0] }
        },
        warnLogs: {
          $sum: { $cond: [{ $eq: ['$level', 'warn'] }, 1, 0] }
        },
        infoLogs: {
          $sum: { $cond: [{ $eq: ['$level', 'info'] }, 1, 0] }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 }
    }
  ]);
};

// Static method to search logs
logSchema.statics.searchLogs = function(query, options = {}) {
  const {
    limit = 100,
    page = 1,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    level = null,
    category = null,
    source = null
  } = options;

  const filter = {
    $or: [
      { message: { $regex: query, $options: 'i' } },
      { 'error.message': { $regex: query, $options: 'i' } },
      { 'error.name': { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  };

  if (level) filter.level = level;
  if (category) filter.category = category;
  if (source) filter.source = source;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(filter)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to cleanup old logs
logSchema.statics.cleanupOldLogs = function(daysToKeep = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    level: { $in: ['debug', 'trace'] }
  });
};

// Static method to get log health
logSchema.statics.getLogHealth = function(period = '24h') {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case '1h':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalLogs: { $sum: 1 },
        errorRate: {
          $avg: { $cond: [{ $eq: ['$level', 'error'] }, 1, 0] }
        },
        warnRate: {
          $avg: { $cond: [{ $eq: ['$level', 'warn'] }, 1, 0] }
        },
        avgResponseTime: { $avg: '$performance.responseTime' },
        avgMemoryUsage: { $avg: '$performance.memoryUsage' },
        avgCpuUsage: { $avg: '$performance.cpuUsage' }
      }
    }
  ]);
};

module.exports = mongoose.model('Log', logSchema);
