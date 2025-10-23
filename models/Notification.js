const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'trip_started',
      'trip_completed',
      'fuel_low',
      'maintenance_due',
      'maintenance_completed',
      'report_created',
      'report_updated',
      'system_alert',
      'weather_alert',
      'traffic_alert',
      'route_update',
      'achievement_unlocked',
      'reminder',
      'other'
    ]
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  deliveryMethod: {
    type: String,
    enum: ['push', 'email', 'sms', 'in_app'],
    default: 'in_app'
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String,
    trim: true
  },
  actionText: {
    type: String,
    trim: true
  },
  relatedEntity: {
    type: {
      type: String,
      enum: ['trip', 'motor', 'maintenance', 'report', 'user']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    source: {
      type: String,
      trim: true
    },
    version: {
      type: String,
      trim: true
    },
    deviceInfo: {
      type: String,
      trim: true
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
      }
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ userId: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ userId: 1, priority: 1 });
notificationSchema.index({ 'metadata.location': '2dsphere' });

// Virtual for time since creation
notificationSchema.virtual('timeSinceCreated').get(function() {
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

// Virtual for urgency level
notificationSchema.virtual('urgencyLevel').get(function() {
  if (this.priority === 'urgent') return 4;
  if (this.priority === 'high') return 3;
  if (this.priority === 'medium') return 2;
  return 1;
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as delivered
notificationSchema.methods.markAsDelivered = function() {
  this.isDelivered = true;
  this.deliveredAt = new Date();
  return this.save();
};

// Method to check if expired
notificationSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Method to check if scheduled
notificationSchema.methods.isScheduled = function() {
  return new Date() < this.scheduledFor;
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, isRead: false });
};

// Static method to get notifications by type
notificationSchema.statics.getByType = function(userId, type, options = {}) {
  const {
    limit = 20,
    page = 1,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find({ userId, type })
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to get recent notifications
notificationSchema.statics.getRecent = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get notifications by priority
notificationSchema.statics.getByPriority = function(userId, priority, options = {}) {
  const {
    limit = 20,
    page = 1,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find({ userId, priority })
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get notification statistics
notificationSchema.statics.getStats = function(userId, period = '30d') {
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
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        unreadCount: {
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
        },
        urgentCount: {
          $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
        },
        highCount: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
        },
        mediumCount: {
          $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] }
        },
        lowCount: {
          $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Static method to create notification
notificationSchema.statics.createNotification = function(notificationData) {
  const {
    userId,
    type,
    title,
    message,
    data = {},
    priority = 'medium',
    deliveryMethod = 'in_app',
    scheduledFor = new Date(),
    expiresAt,
    actionRequired = false,
    actionUrl,
    actionText,
    relatedEntity,
    tags = [],
    metadata = {}
  } = notificationData;

  return this.create({
    userId,
    type,
    title,
    message,
    data,
    priority,
    deliveryMethod,
    scheduledFor,
    expiresAt,
    actionRequired,
    actionUrl,
    actionText,
    relatedEntity,
    tags,
    metadata
  });
};

// Static method to send bulk notifications
notificationSchema.statics.sendBulk = function(userIds, notificationData) {
  const notifications = userIds.map(userId => ({
    ...notificationData,
    userId
  }));

  return this.insertMany(notifications);
};

// Static method to cleanup expired notifications
notificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Static method to get notification preferences
notificationSchema.statics.getUserPreferences = function(userId) {
  // This would typically come from a UserPreferences model
  // For now, return default preferences
  return {
    push: true,
    email: true,
    sms: false,
    inApp: true,
    tripUpdates: true,
    maintenanceReminders: true,
    fuelAlerts: true,
    trafficAlerts: true,
    weatherAlerts: true,
    systemAlerts: true
  };
};

module.exports = mongoose.model('Notification', notificationSchema);
