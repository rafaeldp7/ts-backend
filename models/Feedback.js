const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'bug_report',
      'feature_request',
      'improvement',
      'complaint',
      'compliment',
      'general',
      'app_feedback',
      'route_feedback',
      'safety_concern',
      'performance_issue'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: [
      'ui_ux',
      'performance',
      'navigation',
      'safety',
      'data_accuracy',
      'features',
      'bugs',
      'other'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed', 'duplicate'],
    default: 'open'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  stepsToReproduce: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  expectedBehavior: {
    type: String,
    trim: true,
    maxlength: 500
  },
  actualBehavior: {
    type: String,
    trim: true,
    maxlength: 500
  },
  deviceInfo: {
    platform: {
      type: String,
      enum: ['ios', 'android', 'web', 'desktop'],
      required: true
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
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'document', 'log'],
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      min: 0
    },
    mimeType: {
      type: String,
      trim: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  relatedEntities: {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip'
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route'
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report'
    },
    motorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Motor'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  votes: {
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: {
    status: {
      type: String,
      enum: ['resolved', 'wont_fix', 'duplicate', 'invalid'],
      default: 'resolved'
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: {
      type: Date
    },
    version: {
      type: String,
      trim: true
    }
  },
  metadata: {
    source: {
      type: String,
      enum: ['app', 'web', 'email', 'api'],
      default: 'app'
    },
    userAgent: {
      type: String,
      trim: true
    },
    ipAddress: {
      type: String,
      trim: true
    },
    sessionId: {
      type: String,
      trim: true
    },
    referrer: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
feedbackSchema.index({ userId: 1 });
feedbackSchema.index({ type: 1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ priority: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ assignedTo: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ 'votes.total': -1 });
feedbackSchema.index({ 'location.coordinates': '2dsphere' });
feedbackSchema.index({ userId: 1, status: 1 });
feedbackSchema.index({ type: 1, status: 1 });
feedbackSchema.index({ priority: 1, status: 1 });

// Virtual for vote ratio
feedbackSchema.virtual('voteRatio').get(function() {
  if (this.votes.total === 0) return 0;
  return this.votes.upvotes / this.votes.total;
});

// Virtual for age in days
feedbackSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Virtual for is resolved
feedbackSchema.virtual('isResolved').get(function() {
  return this.status === 'resolved' || this.status === 'closed';
});

// Method to add comment
feedbackSchema.methods.addComment = function(userId, content, isInternal = false) {
  this.comments.push({
    userId,
    content,
    isInternal,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return this.save();
};

// Method to vote on feedback
feedbackSchema.methods.vote = function(isUpvote) {
  if (isUpvote) {
    this.votes.upvotes += 1;
  } else {
    this.votes.downvotes += 1;
  }
  this.votes.total = this.votes.upvotes + this.votes.downvotes;
  return this.save();
};

// Method to assign feedback
feedbackSchema.methods.assign = function(userId) {
  this.assignedTo = userId;
  this.status = 'in_progress';
  return this.save();
};

// Method to resolve feedback
feedbackSchema.methods.resolve = function(resolvedBy, description, version = null) {
  this.status = 'resolved';
  this.resolution = {
    status: 'resolved',
    description,
    resolvedBy,
    resolvedAt: new Date(),
    version
  };
  return this.save();
};

// Method to close feedback
feedbackSchema.methods.close = function(reason = 'resolved') {
  this.status = 'closed';
  this.resolution.status = reason;
  this.resolution.resolvedAt = new Date();
  return this.save();
};

// Method to mark as duplicate
feedbackSchema.methods.markAsDuplicate = function(originalFeedbackId) {
  this.status = 'duplicate';
  this.resolution = {
    status: 'duplicate',
    description: `Duplicate of feedback ${originalFeedbackId}`,
    resolvedAt: new Date()
  };
  return this.save();
};

// Static method to get feedback by user
feedbackSchema.statics.getFeedbackByUser = function(userId, options = {}) {
  const {
    limit = 20,
    page = 1,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status = null,
    type = null
  } = options;

  const filter = { userId };
  if (status) filter.status = status;
  if (type) filter.type = type;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(filter)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('assignedTo', 'name email');
};

// Static method to get feedback by status
feedbackSchema.statics.getFeedbackByStatus = function(status, options = {}) {
  const {
    limit = 20,
    page = 1,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    priority = null
  } = options;

  const filter = { status };
  if (priority) filter.priority = priority;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(filter)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('userId', 'name email')
    .populate('assignedTo', 'name email');
};

// Static method to get popular feedback
feedbackSchema.statics.getPopularFeedback = function(options = {}) {
  const {
    limit = 20,
    minVotes = 5,
    status = 'open'
  } = options;

  return this.find({
    status,
    'votes.total': { $gte: minVotes }
  })
  .sort({ 'votes.total': -1, createdAt: -1 })
  .limit(limit)
  .populate('userId', 'name email');
};

// Static method to get feedback statistics
feedbackSchema.statics.getFeedbackStats = function(period = '30d') {
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
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalFeedback: { $sum: 1 },
        openFeedback: {
          $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
        },
        inProgressFeedback: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        },
        resolvedFeedback: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        closedFeedback: {
          $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
        },
        bugReports: {
          $sum: { $cond: [{ $eq: ['$type', 'bug_report'] }, 1, 0] }
        },
        featureRequests: {
          $sum: { $cond: [{ $eq: ['$type', 'feature_request'] }, 1, 0] }
        },
        complaints: {
          $sum: { $cond: [{ $eq: ['$type', 'complaint'] }, 1, 0] }
        },
        compliments: {
          $sum: { $cond: [{ $eq: ['$type', 'compliment'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Static method to get feedback by category
feedbackSchema.statics.getFeedbackByCategory = function(category, options = {}) {
  const {
    limit = 20,
    page = 1,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find({ category })
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('userId', 'name email');
};

// Static method to search feedback
feedbackSchema.statics.searchFeedback = function(query, options = {}) {
  const {
    limit = 20,
    page = 1,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status = null,
    type = null
  } = options;

  const filter = {
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  };

  if (status) filter.status = status;
  if (type) filter.type = type;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(filter)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('userId', 'name email');
};

// Static method to get feedback trends
feedbackSchema.statics.getFeedbackTrends = function(period = '30d') {
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
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        bugReports: {
          $sum: { $cond: [{ $eq: ['$type', 'bug_report'] }, 1, 0] }
        },
        featureRequests: {
          $sum: { $cond: [{ $eq: ['$type', 'feature_request'] }, 1, 0] }
        },
        complaints: {
          $sum: { $cond: [{ $eq: ['$type', 'complaint'] }, 1, 0] }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

// Static method to cleanup old feedback
feedbackSchema.statics.cleanupOldFeedback = function(daysToKeep = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  return this.deleteMany({
    status: { $in: ['resolved', 'closed'] },
    updatedAt: { $lt: cutoffDate }
  });
};

module.exports = mongoose.model('Feedback', feedbackSchema);
