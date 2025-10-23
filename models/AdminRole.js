const mongoose = require('mongoose');

const adminRoleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  permissions: {
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
    canManageAdmins: { 
      type: Boolean, 
      default: false 
    },
    canAssignRoles: { 
      type: Boolean, 
      default: false 
    },
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