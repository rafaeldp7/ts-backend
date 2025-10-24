const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  
  // Role and Permissions
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminRole',
    required: [true, 'Admin role is required']
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: Date,
  lastLoginAt: Date,
  
  // Profile Information
  profilePicture: String,
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  department: {
    type: String,
    trim: true
  },
  
  // Permissions (inherited from role, but can be overridden)
  permissions: {
    canCreate: { type: Boolean, default: false },
    canRead: { type: Boolean, default: true },
    canUpdate: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canManageAdmins: { type: Boolean, default: false },
    canAssignRoles: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false },
    canManageReports: { type: Boolean, default: false },
    canManageTrips: { type: Boolean, default: false },
    canManageGasStations: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false },
    canExportData: { type: Boolean, default: false },
    canManageSettings: { type: Boolean, default: false }
  },
  
  // Activity Tracking
  activity: {
    totalLogins: { type: Number, default: 0 },
    lastActivityAt: Date,
    loginHistory: [{
      timestamp: Date,
      ipAddress: String,
      userAgent: String,
      success: Boolean
    }],
    actionsPerformed: [{
      action: String,
      resource: String,
      timestamp: Date,
      details: mongoose.Schema.Types.Mixed
    }]
  },
  
  // Security
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      system: { type: Boolean, default: true }
    },
    dashboard: {
      defaultView: { type: String, default: 'overview' },
      refreshInterval: { type: Number, default: 30 }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ createdAt: -1 });
adminSchema.index({ 'activity.lastActivityAt': -1 });

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordChangedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
adminSchema.methods.updateLastLogin = function(ipAddress, userAgent) {
  this.lastLoginAt = new Date();
  this.activity.totalLogins += 1;
  this.activity.lastActivityAt = new Date();
  this.activity.loginHistory.push({
    timestamp: new Date(),
    ipAddress,
    userAgent,
    success: true
  });
  
  // Keep only last 10 login attempts
  if (this.activity.loginHistory.length > 10) {
    this.activity.loginHistory = this.activity.loginHistory.slice(-10);
  }
  
  return this.save();
};

// Method to log action
adminSchema.methods.logAction = function(action, resource, details = {}) {
  this.activity.actionsPerformed.push({
    action,
    resource,
    timestamp: new Date(),
    details
  });
  
  // Keep only last 100 actions
  if (this.activity.actionsPerformed.length > 100) {
    this.activity.actionsPerformed = this.activity.actionsPerformed.slice(-100);
  }
  
  return this.save();
};

// Method to check permission
adminSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Method to get public profile
adminSchema.methods.getPublicProfile = function() {
  const adminObject = this.toObject();
  delete adminObject.password;
  delete adminObject.twoFactorSecret;
  delete adminObject.passwordResetToken;
  return adminObject;
};

// Static method to find active admins
adminSchema.statics.findActive = function() {
  return this.find({ isActive: true }).populate('role');
};

// Static method to get admin statistics
adminSchema.statics.getAdminStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalAdmins: { $sum: 1 },
        activeAdmins: { $sum: { $cond: ['$isActive', 1, 0] } },
        verifiedAdmins: { $sum: { $cond: ['$isVerified', 1, 0] } },
        avgLogins: { $avg: '$activity.totalLogins' }
      }
    }
  ]);
};

module.exports = mongoose.model('Admin', adminSchema);
