const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true,
    trim: true
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  role: { 
    type: String, 
    required: true,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'moderator'
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: { 
    type: Date 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin' 
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

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
adminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for admin's full name
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Get role permissions and level
adminSchema.methods.getRoleInfo = function() {
  const roleConfig = {
    super_admin: {
      level: 100,
      displayName: 'Super Admin',
      permissions: {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canManageAdmins: true,
        canAssignRoles: true,
        canManageUsers: true,
        canManageReports: true,
        canManageTrips: true,
        canManageGasStations: true,
        canViewAnalytics: true,
        canExportData: true,
        canManageSettings: true
      }
    },
    admin: {
      level: 50,
      displayName: 'Admin',
      permissions: {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canManageAdmins: false,
        canAssignRoles: false,
        canManageUsers: true,
        canManageReports: true,
        canManageTrips: true,
        canManageGasStations: true,
        canViewAnalytics: true,
        canExportData: true,
        canManageSettings: false
      }
    },
    moderator: {
      level: 25,
      displayName: 'Moderator',
      permissions: {
        canCreate: false,
        canRead: true,
        canUpdate: true,
        canDelete: false,
        canManageAdmins: false,
        canAssignRoles: false,
        canManageUsers: false,
        canManageReports: true,
        canManageTrips: true,
        canManageGasStations: false,
        canViewAnalytics: true,
        canExportData: false,
        canManageSettings: false
      }
    }
  };

  return roleConfig[this.role] || roleConfig.moderator;
};

// Get public profile without sensitive data
adminSchema.methods.getPublicProfile = function() {
  const roleInfo = this.getRoleInfo();
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    role: this.role,
    roleInfo: roleInfo,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt
  };
};

// Ensure virtuals are included in toJSON output
adminSchema.set('toJSON', { virtuals: true });
adminSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Admin', adminSchema);