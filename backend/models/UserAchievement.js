const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  progress: {
    current: {
      type: Number,
      default: 0,
      min: 0
    },
    target: {
      type: Number,
      required: true,
      min: 1
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'claimed', 'expired'],
    default: 'in_progress'
  },
  completedAt: {
    type: Date
  },
  claimedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  completionCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastProgressUpdate: {
    type: Date,
    default: Date.now
  },
  progressHistory: [{
    value: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    source: {
      type: String,
      enum: ['trip', 'maintenance', 'social', 'system', 'manual'],
      default: 'trip'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  rewards: {
    pointsEarned: {
      type: Number,
      default: 0
    },
    badgesEarned: [{
      type: String,
      trim: true
    }],
    titlesEarned: [{
      type: String,
      trim: true
    }],
    discountsEarned: [{
      type: Number,
      min: 0,
      max: 100
    }],
    featuresUnlocked: [{
      type: String,
      trim: true
    }],
    customRewards: [{
      type: String,
      trim: true
    }]
  },
  metadata: {
    source: {
      type: String,
      enum: ['app', 'web', 'api', 'system'],
      default: 'app'
    },
    version: {
      type: String,
      default: '1.0.0'
    },
    lastModified: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userAchievementSchema.index({ userId: 1 });
userAchievementSchema.index({ achievementId: 1 });
userAchievementSchema.index({ status: 1 });
userAchievementSchema.index({ completedAt: -1 });
userAchievementSchema.index({ claimedAt: -1 });
userAchievementSchema.index({ userId: 1, status: 1 });
userAchievementSchema.index({ userId: 1, achievementId: 1 });
userAchievementSchema.index({ userId: 1, completedAt: -1 });
userAchievementSchema.index({ achievementId: 1, status: 1 });

// Virtual for time since completion
userAchievementSchema.virtual('timeSinceCompletion').get(function() {
  if (!this.completedAt) return null;
  
  const now = new Date();
  const diff = now - this.completedAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Virtual for is expired
userAchievementSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual for is claimable
userAchievementSchema.virtual('isClaimable').get(function() {
  return this.status === 'completed' && !this.claimedAt;
});

// Method to update progress
userAchievementSchema.methods.updateProgress = function(value, source = 'trip', metadata = {}) {
  if (this.status === 'completed' || this.status === 'claimed') {
    return this;
  }
  
  this.progress.current = Math.max(this.progress.current, value);
  this.progress.percentage = Math.min((this.progress.current / this.progress.target) * 100, 100);
  this.lastProgressUpdate = new Date();
  
  // Add to progress history
  this.progressHistory.push({
    value,
    timestamp: new Date(),
    source,
    metadata
  });
  
  // Check if achievement is completed
  if (this.progress.current >= this.progress.target) {
    this.status = 'completed';
    this.completedAt = new Date();
    this.completionCount += 1;
  }
  
  return this.save();
};

// Method to claim achievement
userAchievementSchema.methods.claim = function() {
  if (this.status !== 'completed') {
    throw new Error('Achievement must be completed before claiming');
  }
  
  this.status = 'claimed';
  this.claimedAt = new Date();
  
  return this.save();
};

// Method to reset progress
userAchievementSchema.methods.resetProgress = function() {
  this.progress.current = 0;
  this.progress.percentage = 0;
  this.status = 'in_progress';
  this.completedAt = undefined;
  this.claimedAt = undefined;
  this.progressHistory = [];
  
  return this.save();
};

// Method to expire achievement
userAchievementSchema.methods.expire = function() {
  this.status = 'expired';
  return this.save();
};

// Method to get progress summary
userAchievementSchema.methods.getProgressSummary = function() {
  return {
    current: this.progress.current,
    target: this.progress.target,
    percentage: this.progress.percentage,
    status: this.status,
    completedAt: this.completedAt,
    claimedAt: this.claimedAt,
    completionCount: this.completionCount,
    isExpired: this.isExpired,
    isClaimable: this.isClaimable
  };
};

// Method to get rewards summary
userAchievementSchema.methods.getRewardsSummary = function() {
  return {
    pointsEarned: this.rewards.pointsEarned,
    badgesEarned: this.rewards.badgesEarned,
    titlesEarned: this.rewards.titlesEarned,
    discountsEarned: this.rewards.discountsEarned,
    featuresUnlocked: this.rewards.featuresUnlocked,
    customRewards: this.rewards.customRewards
  };
};

// Static method to get user achievements
userAchievementSchema.statics.getUserAchievements = function(userId, options = {}) {
  const {
    limit = 20,
    page = 1,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status = null,
    category = null
  } = options;

  const filter = { userId };
  if (status) filter.status = status;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(filter)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('achievementId');
};

// Static method to get user achievement statistics
userAchievementSchema.statics.getUserAchievementStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalAchievements: { $sum: 1 },
        completedAchievements: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        claimedAchievements: {
          $sum: { $cond: [{ $eq: ['$status', 'claimed'] }, 1, 0] }
        },
        inProgressAchievements: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        },
        expiredAchievements: {
          $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] }
        },
        totalPointsEarned: { $sum: '$rewards.pointsEarned' },
        totalCompletions: { $sum: '$completionCount' }
      }
    }
  ]);
};

// Static method to get user achievement progress
userAchievementSchema.statics.getUserAchievementProgress = function(userId, achievementId) {
  return this.findOne({ userId, achievementId });
};

// Static method to get user achievement leaderboard
userAchievementSchema.statics.getUserAchievementLeaderboard = function(options = {}) {
  const {
    limit = 20,
    sortBy = 'totalPoints',
    sortOrder = 'desc',
    period = 'all'
  } = options;

  let matchStage = {};
  
  if (period !== 'all') {
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
    
    matchStage.completedAt = { $gte: startDate };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$userId',
        totalPoints: { $sum: '$rewards.pointsEarned' },
        completedAchievements: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        claimedAchievements: {
          $sum: { $cond: [{ $eq: ['$status', 'claimed'] }, 1, 0] }
        },
        totalCompletions: { $sum: '$completionCount' }
      }
    },
    {
      $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        userId: '$_id',
        userName: '$user.name',
        userEmail: '$user.email',
        totalPoints: 1,
        completedAchievements: 1,
        claimedAchievements: 1,
        totalCompletions: 1
      }
    }
  ]);
};

// Static method to get achievement completion statistics
userAchievementSchema.statics.getAchievementCompletionStats = function(achievementId) {
  return this.aggregate([
    { $match: { achievementId: mongoose.Types.ObjectId(achievementId) } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        completedAttempts: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        claimedAttempts: {
          $sum: { $cond: [{ $eq: ['$status', 'claimed'] }, 1, 0] }
        },
        inProgressAttempts: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        },
        expiredAttempts: {
          $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] }
        },
        avgCompletionTime: { $avg: '$completedAt' },
        totalPointsEarned: { $sum: '$rewards.pointsEarned' }
      }
    }
  ]);
};

// Static method to get user achievement trends
userAchievementSchema.statics.getUserAchievementTrends = function(userId, period = '30d') {
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
        completedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$completedAt' },
          month: { $month: '$completedAt' },
          day: { $dayOfMonth: '$completedAt' }
        },
        completedAchievements: { $sum: 1 },
        pointsEarned: { $sum: '$rewards.pointsEarned' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

// Static method to get user achievement recommendations
userAchievementSchema.statics.getUserAchievementRecommendations = function(userId, limit = 10) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'achievements',
        localField: 'achievementId',
        foreignField: '_id',
        as: 'achievement'
      }
    },
    {
      $unwind: '$achievement'
    },
    {
      $match: {
        'achievement.isActive': true,
        status: { $in: ['in_progress', 'completed'] }
      }
    },
    {
      $sort: { 'achievement.points': -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        achievementId: 1,
        achievement: 1,
        progress: 1,
        status: 1,
        completedAt: 1,
        claimedAt: 1
      }
    }
  ]);
};

// Static method to cleanup expired achievements
userAchievementSchema.statics.cleanupExpiredAchievements = function() {
  const now = new Date();
  return this.updateMany(
    {
      expiresAt: { $lt: now },
      status: { $in: ['in_progress', 'completed'] }
    },
    { status: 'expired' }
  );
};

// Static method to get user achievement badges
userAchievementSchema.statics.getUserAchievementBadges = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), status: 'claimed' } },
    {
      $lookup: {
        from: 'achievements',
        localField: 'achievementId',
        foreignField: '_id',
        as: 'achievement'
      }
    },
    {
      $unwind: '$achievement'
    },
    {
      $group: {
        _id: '$achievement.category',
        count: { $sum: 1 },
        badges: { $push: '$achievement.badge' }
      }
    }
  ]);
};

module.exports = mongoose.model('UserAchievement', userAchievementSchema);
