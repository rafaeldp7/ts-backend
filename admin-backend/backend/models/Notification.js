const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient Information
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  
  // Notification Content
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  
  // Notification Type
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: [
      'info', 'success', 'warning', 'error',
      'trip_reminder', 'trip_completed', 'trip_cancelled',
      'report_verified', 'report_resolved', 'report_rejected',
      'fuel_price_update', 'station_verified', 'station_rejected',
      'maintenance_reminder', 'registration_expiry', 'insurance_expiry',
      'system_update', 'security_alert', 'admin_message'
    ]
  },
  
  // Priority and Status
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'clicked', 'dismissed'],
    default: 'sent'
  },
  
  // Action Information
  action: {
    type: {
      type: String,
      enum: ['none', 'navigate', 'open_url', 'call', 'email', 'custom']
    },
    url: String,
    phone: String,
    email: String,
    customAction: String,
    parameters: mongoose.Schema.Types.Mixed
  },
  
  // Related Data
  relatedEntity: {
    type: {
      type: String,
      enum: ['trip', 'report', 'gas_station', 'motorcycle', 'user', 'admin', 'system']
    },
    entityId: mongoose.Schema.Types.ObjectId,
    entityData: mongoose.Schema.Types.Mixed
  },
  
  // Delivery Information
  delivery: {
    channels: [{
      type: String,
      enum: ['push', 'email', 'sms', 'in_app'],
      required: true
    }],
    sentAt: Date,
    deliveredAt: Date,
    readAt: Date,
    clickedAt: Date,
    dismissedAt: Date
  },
  
  // Sender Information
  sender: {
    type: {
      type: String,
      enum: ['system', 'admin', 'user'],
      default: 'system'
    },
    id: mongoose.Schema.Types.ObjectId,
    name: String
  },
  
  // Expiration
  expiresAt: Date,
  isExpired: {
    type: Boolean,
    default: false
  },
  
  // Grouping
  groupId: String, // For grouping related notifications
  isGrouped: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  metadata: {
    source: String,
    version: String,
    tags: [String],
    category: String
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
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ 'delivery.sentAt': -1 });
notificationSchema.index({ 'delivery.readAt': -1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ isArchived: 1 });
notificationSchema.index({ groupId: 1 });

// Virtual for age
notificationSchema.virtual('age').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60)); // Age in minutes
});

// Virtual for is read
notificationSchema.virtual('isRead').get(function() {
  return this.status === 'read' || this.status === 'clicked' || this.status === 'dismissed';
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.delivery.readAt = new Date();
  return this.save();
};

// Method to mark as clicked
notificationSchema.methods.markAsClicked = function() {
  this.status = 'clicked';
  this.delivery.clickedAt = new Date();
  return this.save();
};

// Method to dismiss
notificationSchema.methods.dismiss = function() {
  this.status = 'dismissed';
  this.delivery.dismissedAt = new Date();
  return this.save();
};

// Method to check if expired
notificationSchema.methods.checkExpiration = function() {
  if (this.expiresAt && this.expiresAt < new Date()) {
    this.isExpired = true;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to find unread notifications
notificationSchema.statics.findUnread = function(userId) {
  return this.find({
    recipient: userId,
    status: { $in: ['sent', 'delivered'] },
    isExpired: false,
    isArchived: false
  }).sort({ createdAt: -1 });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, status: { $in: ['sent', 'delivered'] } },
    { 
      status: 'read',
      'delivery.readAt': new Date()
    }
  );
};

// Static method to get notification statistics
notificationSchema.statics.getNotificationStats = function(userId = null) {
  const match = userId ? { recipient: userId, isArchived: false } : { isArchived: false };
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        unreadNotifications: { $sum: { $cond: [{ $in: ['$status', ['sent', 'delivered']] }, 1, 0] } },
        readNotifications: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
        clickedNotifications: { $sum: { $cond: [{ $eq: ['$status', 'clicked'] }, 1, 0] } }
      }
    }
  ]);
};

// Static method to get notifications by type
notificationSchema.statics.getByType = function(userId, type) {
  return this.find({
    recipient: userId,
    type: type,
    isArchived: false
  }).sort({ createdAt: -1 });
};

// Static method to cleanup expired notifications
notificationSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    { expiresAt: { $lt: new Date() }, isExpired: false },
    { isExpired: true }
  );
};

// Static method to get notification summary
notificationSchema.statics.getNotificationSummary = function(userId) {
  return this.aggregate([
    { $match: { recipient: userId, isArchived: false } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        unread: { $sum: { $cond: [{ $in: ['$status', ['sent', 'delivered']] }, 1, 0] } }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Notification', notificationSchema);
