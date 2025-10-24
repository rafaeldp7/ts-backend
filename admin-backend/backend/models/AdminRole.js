const mongoose = require('mongoose');

const adminRoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z_]+$/, 'Role name can only contain lowercase letters and underscores']
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    maxlength: [50, 'Display name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  
  // Permissions
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
  
  // Role Status
  isActive: {
    type: Boolean,
    default: true
  },
  isSystem: {
    type: Boolean,
    default: false // System roles cannot be deleted
  },
  
  // Hierarchy
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
adminRoleSchema.index({ name: 1 });
adminRoleSchema.index({ isActive: 1 });
adminRoleSchema.index({ level: 1 });

// Virtual for permission count
adminRoleSchema.virtual('permissionCount').get(function() {
  return Object.values(this.permissions).filter(Boolean).length;
});

// Method to check if role has permission
adminRoleSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Method to get all permissions
adminRoleSchema.methods.getAllPermissions = function() {
  return Object.keys(this.permissions).filter(key => this.permissions[key]);
};

// Static method to find roles by permission
adminRoleSchema.statics.findByPermission = function(permission) {
  return this.find({ [`permissions.${permission}`]: true, isActive: true });
};

// Static method to get role hierarchy
adminRoleSchema.statics.getHierarchy = function() {
  return this.find({ isActive: true }).sort({ level: -1 });
};

// Pre-save middleware to validate permissions
adminRoleSchema.pre('save', function(next) {
  // Super admin should have all permissions
  if (this.name === 'super_admin') {
    Object.keys(this.permissions).forEach(key => {
      this.permissions[key] = true;
    });
  }
  
  // Viewer should only have read permissions
  if (this.name === 'viewer') {
    this.permissions.canRead = true;
    Object.keys(this.permissions).forEach(key => {
      if (key !== 'canRead') {
        this.permissions[key] = false;
      }
    });
  }
  
  next();
});

// Pre-remove middleware to prevent deletion of system roles
adminRoleSchema.pre('remove', function(next) {
  if (this.isSystem) {
    const error = new Error('Cannot delete system role');
    error.statusCode = 400;
    return next(error);
  }
  next();
});

module.exports = mongoose.model('AdminRole', adminRoleSchema);
