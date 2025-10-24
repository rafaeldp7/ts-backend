const mongoose = require('mongoose');

const adminRoleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    enum: ['super_admin', 'admin', 'moderator']
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: Number,
    required: true,
    enum: [100, 50, 25] // 100 = Super Admin, 50 = Admin, 25 = Moderator
  },
  permissions: {
    // Basic CRUD permissions
    canCreate: { 
      type: Boolean, 
      default: false 
    },
    canRead: { 
      type: Boolean, 
      default: true 
    },
    canUpdate: { 
      type: Boolean, 
      default: false 
    },
    canDelete: { 
      type: Boolean, 
      default: false 
    },
    // Admin management permissions
    canManageAdmins: { 
      type: Boolean, 
      default: false 
    },
    canAssignRoles: { 
      type: Boolean, 
      default: false 
    },
    // Content management permissions
    canManageUsers: {
      type: Boolean,
      default: false
    },
    canManageReports: {
      type: Boolean,
      default: false
    },
    canManageTrips: {
      type: Boolean,
      default: false
    },
    canManageGasStations: {
      type: Boolean,
      default: false
    },
    // System permissions
    canViewAnalytics: {
      type: Boolean,
      default: false
    },
    canExportData: {
      type: Boolean,
      default: false
    },
    canManageSettings: {
      type: Boolean,
      default: false
    }
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSystem: {
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
});

module.exports = mongoose.model('AdminRole', adminRoleSchema);