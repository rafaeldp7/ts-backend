const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin', 
    required: true 
  },
  adminName: { 
    type: String, 
    required: true,
    trim: true
  },
  adminEmail: {
    type: String,
    required: true,
    trim: true
  },
  action: { 
    type: String, 
    required: true,
    enum: [
      'CREATE', 'READ', 'UPDATE', 'DELETE', 
      'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT',
      'ASSIGN_ROLE', 'REMOVE_ROLE', 'ACTIVATE', 
      'DEACTIVATE', 'PASSWORD_CHANGE', 'PROFILE_UPDATE'
    ]
  },
  resource: { 
    type: String, 
    required: true,
    enum: [
      'USER', 'REPORT', 'MOTOR', 'ADMIN', 'TRIP', 
      'GAS_STATION', 'MAINTENANCE', 'ANALYTICS',
      'SETTINGS', 'EXPORT', 'IMPORT', 'SYSTEM'
    ]
  },
  resourceId: { 
    type: String,
    trim: true
  },
  resourceName: {
    type: String,
    trim: true
  },
  details: {
    before: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    after: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    description: {
      type: String,
      trim: true
    }
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'PARTIAL'],
    default: 'SUCCESS'
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('AdminLog', adminLogSchema);