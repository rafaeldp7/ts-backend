# 🚀 **COMPLETE IMPLEMENTATION PLAN**

## 📊 **EXECUTIVE SUMMARY**

**Status**: ✅ **FRONTEND-BACKEND ALIGNMENT COMPLETE**  
**Backend Requirements**: 🔧 **IMPLEMENTATION NEEDED**  
**Frontend Ready**: ✅ **100% COMPLETE**  
**API Endpoints**: 📋 **21 ENDPOINTS REQUIRED**  
**Models**: 🗄️ **3 MODELS REQUIRED**  
**Controllers**: 🎮 **3 CONTROLLERS REQUIRED**  

---

## 🎯 **IMPLEMENTATION STATUS ANALYSIS**

### **✅ FRONTEND STATUS: 100% COMPLETE**
- ✅ **Admin Authentication Service** - `adminAuthService.js`
- ✅ **Admin Settings Service** - `adminSettingsService.js`
- ✅ **Admin Auth Context** - `AdminAuthContext.jsx`
- ✅ **Protected Admin Routes** - `ProtectedAdminRoute.jsx`
- ✅ **Admin Login Component** - `AdminLogin.jsx`
- ✅ **Updated Admin Service** - Fixed API endpoints
- ✅ **Updated Admin Management** - Fixed form structure
- ✅ **Updated App.js** - Using AdminAuthProvider

### **❌ BACKEND STATUS: NEEDS IMPLEMENTATION**
- ❌ **Admin Models** - 3 models need to be created
- ❌ **Admin Controllers** - 3 controllers need to be created
- ❌ **Admin Routes** - 21 endpoints need to be created
- ❌ **Admin Middleware** - Authentication and permission middleware
- ❌ **Default Data** - Default roles and admin account

---

## 🔧 **BACKEND IMPLEMENTATION ROADMAP**

### **Phase 1: Core Models (CRITICAL)**

#### **1. Create Admin Model** (`backend/models/Admin.js`)
```javascript
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
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AdminRole', 
    required: true 
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

// Ensure virtuals are included in toJSON output
adminSchema.set('toJSON', { virtuals: true });
adminSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Admin', adminSchema);
```

#### **2. Create AdminRole Model** (`backend/models/AdminRole.js`)
```javascript
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
```

#### **3. Create AdminLog Model** (`backend/models/AdminLog.js`)
```javascript
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
```

### **Phase 2: Controllers (HIGH)**

#### **1. Create AdminController** (`backend/controllers/adminController.js`)
```javascript
const Admin = require('../models/Admin');
const AdminRole = require('../models/AdminRole');
const AdminLog = require('../models/AdminLog');
const bcrypt = require('bcryptjs');

class AdminController {
  // Get all admins with pagination and search
  async getAdmins(req, res) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      // Build filter
      const filter = {};
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort options
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const admins = await Admin.find(filter)
        .populate('role', 'name displayName permissions')
        .populate('createdBy', 'firstName lastName email')
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Admin.countDocuments(filter);

      // Log admin activity
      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN', null, null, {
        description: 'Retrieved admin list',
        search: search || null
      });

      res.json({
        success: true,
        data: {
          admins,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      console.error('Error fetching admins:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN', null, null, {
        description: 'Failed to retrieve admin list',
        error: error.message
      }, 'FAILED', 'HIGH');
      res.status(500).json({ success: false, error: 'Failed to fetch admins' });
    }
  }

  // Get single admin by ID
  async getAdmin(req, res) {
    try {
      const admin = await Admin.findById(req.params.id)
        .populate('role', 'name displayName permissions')
        .populate('createdBy', 'firstName lastName email');

      if (!admin) {
        await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN', req.params.id, null, {
          description: 'Attempted to retrieve non-existent admin'
        }, 'FAILED', 'MEDIUM');
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }

      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN', admin._id, admin.fullName, {
        description: 'Retrieved single admin details'
      });

      res.json({ success: true, data: admin });
    } catch (error) {
      console.error('Error fetching admin:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN', req.params.id, null, {
        description: 'Failed to retrieve single admin details',
        error: error.message
      }, 'FAILED', 'HIGH');
      res.status(500).json({ success: false, error: 'Failed to fetch admin' });
    }
  }

  // Create new admin account
  async createAdmin(req, res) {
    try {
      const { firstName, lastName, email, password, roleId } = req.body;

      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        await this.logAdminActivity(req.admin.id, req.admin.email, 'CREATE', 'ADMIN', null, email, {
          description: 'Attempted to create admin with existing email',
          email
        }, 'FAILED', 'MEDIUM');
        return res.status(400).json({
          success: false,
          error: 'Admin with this email already exists'
        });
      }

      // Verify role exists
      const role = await AdminRole.findById(roleId);
      if (!role) {
        await this.logAdminActivity(req.admin.id, req.admin.email, 'CREATE', 'ADMIN', null, email, {
          description: 'Attempted to create admin with invalid role',
          roleId
        }, 'FAILED', 'MEDIUM');
        return res.status(400).json({
          success: false,
          error: 'Invalid role specified'
        });
      }

      const admin = new Admin({
        firstName,
        lastName,
        email,
        password,
        role: roleId,
        createdBy: req.admin.id
      });

      await admin.save();

      // Populate the created admin
      const populatedAdmin = await Admin.findById(admin._id)
        .populate('role', 'name displayName permissions')
        .populate('createdBy', 'firstName lastName email');

      // Log admin activity
      await this.logAdminActivity(req.admin.id, req.admin.email, 'CREATE', 'ADMIN', admin._id, admin.fullName, {
        description: 'New admin account created',
        newAdminEmail: admin.email,
        assignedRole: role.displayName
      });

      res.status(201).json({ success: true, data: populatedAdmin });
    } catch (error) {
      console.error('Error creating admin:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'CREATE', 'ADMIN', null, req.body.email, {
        description: 'Failed to create admin account',
        error: error.message
      }, 'FAILED', 'CRITICAL');
      res.status(500).json({ success: false, error: 'Failed to create admin' });
    }
  }

  // Update admin details
  async updateAdmin(req, res) {
    try {
      const { firstName, lastName, email, roleId, isActive } = req.body;
      const adminId = req.params.id;

      const admin = await Admin.findById(adminId);
      if (!admin) {
        await this.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'ADMIN', adminId, null, {
          description: 'Attempted to update non-existent admin'
        }, 'FAILED', 'MEDIUM');
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }

      // Store before state for logging
      const beforeState = { ...admin.toObject() };

      // Check if email is being changed to an existing one
      if (email && email !== admin.email) {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin && existingAdmin._id.toString() !== adminId) {
          await this.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'ADMIN', adminId, admin.fullName, {
            description: 'Attempted to change email to an already existing one',
            newEmail: email
          }, 'FAILED', 'MEDIUM');
          return res.status(400).json({ success: false, error: 'Email already in use by another admin' });
        }
      }

      // Update fields
      admin.firstName = firstName || admin.firstName;
      admin.lastName = lastName || admin.lastName;
      admin.email = email || admin.email;
      admin.isActive = typeof isActive === 'boolean' ? isActive : admin.isActive;

      // If roleId is provided, update role
      if (roleId && roleId.toString() !== admin.role.toString()) {
        const newRole = await AdminRole.findById(roleId);
        if (!newRole) {
          await this.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'ADMIN', adminId, admin.fullName, {
            description: 'Attempted to assign invalid role',
            roleId
          }, 'FAILED', 'MEDIUM');
          return res.status(400).json({ success: false, error: 'Invalid role specified' });
        }
        admin.role = roleId;
      }

      admin.updatedAt = Date.now();
      await admin.save();

      const afterState = { ...admin.toObject() };

      // Log admin activity
      await this.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'ADMIN', admin._id, admin.fullName, {
        description: 'Admin details updated',
        before: beforeState,
        after: afterState
      });

      const populatedAdmin = await Admin.findById(admin._id)
        .populate('role', 'name displayName permissions')
        .populate('createdBy', 'firstName lastName email');

      res.json({ success: true, data: populatedAdmin });
    } catch (error) {
      console.error('Error updating admin:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'ADMIN', req.params.id, null, {
        description: 'Failed to update admin details',
        error: error.message
      }, 'FAILED', 'CRITICAL');
      res.status(500).json({ success: false, error: 'Failed to update admin' });
    }
  }

  // Update admin role (specific endpoint for role change)
  async updateAdminRole(req, res) {
    try {
      const { roleId } = req.body;
      const adminId = req.params.id;

      const admin = await Admin.findById(adminId);
      if (!admin) {
        await this.logAdminActivity(req.admin.id, req.admin.email, 'ASSIGN_ROLE', 'ADMIN', adminId, null, {
          description: 'Attempted to assign role to non-existent admin'
        }, 'FAILED', 'MEDIUM');
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }

      const beforeRole = admin.role.toString();

      const newRole = await AdminRole.findById(roleId);
      if (!newRole) {
        await this.logAdminActivity(req.admin.id, req.admin.email, 'ASSIGN_ROLE', 'ADMIN', adminId, admin.fullName, {
          description: 'Attempted to assign invalid role',
          roleId
        }, 'FAILED', 'MEDIUM');
        return res.status(400).json({ success: false, error: 'Invalid role specified' });
      }

      admin.role = roleId;
      admin.updatedAt = Date.now();
      await admin.save();

      // Log admin activity
      await this.logAdminActivity(req.admin.id, req.admin.email, 'ASSIGN_ROLE', 'ADMIN', admin._id, admin.fullName, {
        description: `Admin role changed from ${beforeRole} to ${newRole.displayName}`,
        oldRoleId: beforeRole,
        newRoleId: newRole._id,
        newRoleName: newRole.displayName
      });

      const populatedAdmin = await Admin.findById(admin._id)
        .populate('role', 'name displayName permissions')
        .populate('createdBy', 'firstName lastName email');

      res.json({ success: true, data: populatedAdmin });
    } catch (error) {
      console.error('Error updating admin role:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'ASSIGN_ROLE', 'ADMIN', req.params.id, null, {
        description: 'Failed to update admin role',
        error: error.message
      }, 'FAILED', 'CRITICAL');
      res.status(500).json({ success: false, error: 'Failed to update admin role' });
    }
  }

  // Deactivate admin account
  async deactivateAdmin(req, res) {
    try {
      const adminId = req.params.id;

      const admin = await Admin.findById(adminId);
      if (!admin) {
        await this.logAdminActivity(req.admin.id, req.admin.email, 'DEACTIVATE', 'ADMIN', adminId, null, {
          description: 'Attempted to deactivate non-existent admin'
        }, 'FAILED', 'MEDIUM');
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }

      if (admin._id.toString() === req.admin.id.toString()) {
        await this.logAdminActivity(req.admin.id, req.admin.email, 'DEACTIVATE', 'ADMIN', adminId, admin.fullName, {
          description: 'Attempted to deactivate own admin account'
        }, 'FAILED', 'HIGH');
        return res.status(400).json({ success: false, error: 'Cannot deactivate your own account' });
      }

      admin.isActive = false;
      admin.updatedAt = Date.now();
      await admin.save();

      // Log admin activity
      await this.logAdminActivity(req.admin.id, req.admin.email, 'DEACTIVATE', 'ADMIN', admin._id, admin.fullName, {
        description: 'Admin account deactivated'
      });

      const populatedAdmin = await Admin.findById(admin._id)
        .populate('role', 'name displayName permissions')
        .populate('createdBy', 'firstName lastName email');

      res.json({ success: true, data: populatedAdmin });
    } catch (error) {
      console.error('Error deactivating admin:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'DEACTIVATE', 'ADMIN', req.params.id, null, {
        description: 'Failed to deactivate admin account',
        error: error.message
      }, 'FAILED', 'CRITICAL');
      res.status(500).json({ success: false, error: 'Failed to deactivate admin' });
    }
  }

  // Activate admin account
  async activateAdmin(req, res) {
    try {
      const adminId = req.params.id;

      const admin = await Admin.findById(adminId);
      if (!admin) {
        await this.logAdminActivity(req.admin.id, req.admin.email, 'ACTIVATE', 'ADMIN', adminId, null, {
          description: 'Attempted to activate non-existent admin'
        }, 'FAILED', 'MEDIUM');
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }

      admin.isActive = true;
      admin.updatedAt = Date.now();
      await admin.save();

      // Log admin activity
      await this.logAdminActivity(req.admin.id, req.admin.email, 'ACTIVATE', 'ADMIN', admin._id, admin.fullName, {
        description: 'Admin account activated'
      });

      const populatedAdmin = await Admin.findById(admin._id)
        .populate('role', 'name displayName permissions')
        .populate('createdBy', 'firstName lastName email');

      res.json({ success: true, data: populatedAdmin });
    } catch (error) {
      console.error('Error activating admin:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'ACTIVATE', 'ADMIN', req.params.id, null, {
        description: 'Failed to activate admin account',
        error: error.message
      }, 'FAILED', 'CRITICAL');
      res.status(500).json({ success: false, error: 'Failed to activate admin' });
    }
  }

  // Get all admin roles
  async getAdminRoles(req, res) {
    try {
      const roles = await AdminRole.find({ isActive: true }).sort({ name: 1 });

      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN_ROLE', null, null, {
        description: 'Retrieved admin roles list'
      });

      res.json({ success: true, data: roles });
    } catch (error) {
      console.error('Error fetching admin roles:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN_ROLE', null, null, {
        description: 'Failed to retrieve admin roles',
        error: error.message
      }, 'FAILED', 'HIGH');
      res.status(500).json({ success: false, error: 'Failed to fetch admin roles' });
    }
  }

  // Create new admin role
  async createAdminRole(req, res) {
    try {
      const { name, displayName, permissions, description } = req.body;

      // Check if role already exists
      const existingRole = await AdminRole.findOne({ name });
      if (existingRole) {
        await this.logAdminActivity(req.admin.id, req.admin.email, 'CREATE', 'ADMIN_ROLE', null, name, {
          description: 'Attempted to create role with existing name',
          roleName: name
        }, 'FAILED', 'MEDIUM');
        return res.status(400).json({
          success: false,
          error: 'Role with this name already exists'
        });
      }

      const role = new AdminRole({
        name,
        displayName,
        permissions,
        description
      });

      await role.save();

      // Log admin activity
      await this.logAdminActivity(req.admin.id, req.admin.email, 'CREATE', 'ADMIN_ROLE', role._id, role.displayName, {
        description: 'New admin role created',
        roleName: role.name,
        permissions: role.permissions
      });

      res.status(201).json({ success: true, data: role });
    } catch (error) {
      console.error('Error creating admin role:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'CREATE', 'ADMIN_ROLE', null, req.body.name, {
        description: 'Failed to create admin role',
        error: error.message
      }, 'FAILED', 'CRITICAL');
      res.status(500).json({ success: false, error: 'Failed to create admin role' });
    }
  }

  // Get admin logs
  async getAdminLogs(req, res) {
    try {
      const { page = 1, limit = 50, adminId, action, resource, startDate, endDate } = req.query;

      // Build filter
      const filter = {};
      if (adminId) filter.adminId = adminId;
      if (action) filter.action = action;
      if (resource) filter.resource = resource;
      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = new Date(startDate);
        if (endDate) filter.timestamp.$lte = new Date(endDate);
      }

      const logs = await AdminLog.find(filter)
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await AdminLog.countDocuments(filter);

      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN_LOG', null, null, {
        description: 'Retrieved admin logs',
        filters: { adminId, action, resource, startDate, endDate }
      });

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN_LOG', null, null, {
        description: 'Failed to retrieve admin logs',
        error: error.message
      }, 'FAILED', 'HIGH');
      res.status(500).json({ success: false, error: 'Failed to fetch admin logs' });
    }
  }

  // Get current admin's logs
  async getMyAdminLogs(req, res) {
    try {
      const { page = 1, limit = 50, action, resource, startDate, endDate } = req.query;

      // Build filter
      const filter = { adminId: req.admin.id };
      if (action) filter.action = action;
      if (resource) filter.resource = resource;
      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = new Date(startDate);
        if (endDate) filter.timestamp.$lte = new Date(endDate);
      }

      const logs = await AdminLog.find(filter)
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await AdminLog.countDocuments(filter);

      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN_LOG', null, null, {
        description: 'Retrieved personal admin logs',
        filters: { action, resource, startDate, endDate }
      });

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });
    } catch (error) {
      console.error('Error fetching my admin logs:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN_LOG', null, null, {
        description: 'Failed to retrieve personal admin logs',
        error: error.message
      }, 'FAILED', 'HIGH');
      res.status(500).json({ success: false, error: 'Failed to fetch my admin logs' });
    }
  }

  // Helper method to log admin activity
  async logAdminActivity(adminId, adminEmail, action, resource, resourceId, resourceName, details, status = 'SUCCESS', severity = 'MEDIUM') {
    try {
      const log = new AdminLog({
        adminId,
        adminName: adminEmail.split('@')[0], // Simple name extraction
        adminEmail,
        action,
        resource,
        resourceId,
        resourceName,
        details,
        status,
        severity
      });

      await log.save();
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  }
}

module.exports = new AdminController();
```

#### **2. Create AdminAuthController** (`backend/controllers/adminAuthController.js`)
```javascript
const Admin = require('../models/Admin');
const AdminLog = require('../models/AdminLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AdminAuthController {
  // Admin login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find admin by email
      const admin = await Admin.findOne({ email }).populate('role', 'name displayName permissions');
      
      if (!admin) {
        await this.logAdminActivity(null, email, 'LOGIN', 'ADMIN', null, null, {
          description: 'Login attempt with non-existent email',
          email
        }, 'FAILED', 'MEDIUM');
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check if admin is active
      if (!admin.isActive) {
        await this.logAdminActivity(admin._id, admin.email, 'LOGIN', 'ADMIN', null, null, {
          description: 'Login attempt by inactive admin',
          email
        }, 'FAILED', 'HIGH');
        return res.status(401).json({
          success: false,
          error: 'Account is deactivated'
        });
      }

      // Check password
      const isMatch = await admin.matchPassword(password);
      if (!isMatch) {
        await this.logAdminActivity(admin._id, admin.email, 'LOGIN', 'ADMIN', null, null, {
          description: 'Login attempt with incorrect password',
          email
        }, 'FAILED', 'MEDIUM');
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Update last login
      admin.lastLogin = new Date();
      await admin.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      // Log successful login
      await this.logAdminActivity(admin._id, admin.email, 'LOGIN', 'ADMIN', null, null, {
        description: 'Successful admin login',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }, 'SUCCESS', 'LOW');

      res.json({
        success: true,
        data: {
          token,
          admin: {
            id: admin._id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            role: admin.role,
            isActive: admin.isActive,
            lastLogin: admin.lastLogin
          }
        }
      });
    } catch (error) {
      console.error('Error during admin login:', error);
      await this.logAdminActivity(null, req.body.email, 'LOGIN', 'ADMIN', null, null, {
        description: 'Login attempt failed due to server error',
        error: error.message
      }, 'FAILED', 'CRITICAL');
      res.status(500).json({ success: false, error: 'Login failed' });
    }
  }

  // Admin logout
  async logout(req, res) {
    try {
      // Log logout activity
      await this.logAdminActivity(req.admin.id, req.admin.email, 'LOGOUT', 'ADMIN', null, null, {
        description: 'Admin logout',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }, 'SUCCESS', 'LOW');

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Error during admin logout:', error);
      res.status(500).json({ success: false, error: 'Logout failed' });
    }
  }

  // Get admin profile
  async getProfile(req, res) {
    try {
      const admin = await Admin.findById(req.admin.id)
        .populate('role', 'name displayName permissions')
        .populate('createdBy', 'firstName lastName email');

      if (!admin) {
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }

      // Log profile access
      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN', req.admin.id, admin.fullName, {
        description: 'Retrieved admin profile'
      });

      res.json({ success: true, data: admin });
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN', req.admin.id, null, {
        description: 'Failed to retrieve admin profile',
        error: error.message
      }, 'FAILED', 'HIGH');
      res.status(500).json({ success: false, error: 'Failed to fetch profile' });
    }
  }

  // Update admin profile
  async updateProfile(req, res) {
    try {
      const { firstName, lastName, email } = req.body;
      const adminId = req.admin.id;

      const admin = await Admin.findById(adminId);
      if (!admin) {
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }

      // Store before state for logging
      const beforeState = { ...admin.toObject() };

      // Check if email is being changed to an existing one
      if (email && email !== admin.email) {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin && existingAdmin._id.toString() !== adminId) {
          await this.logAdminActivity(adminId, admin.email, 'UPDATE', 'ADMIN', adminId, admin.fullName, {
            description: 'Attempted to change email to an already existing one',
            newEmail: email
          }, 'FAILED', 'MEDIUM');
          return res.status(400).json({ success: false, error: 'Email already in use by another admin' });
        }
      }

      // Update fields
      admin.firstName = firstName || admin.firstName;
      admin.lastName = lastName || admin.lastName;
      admin.email = email || admin.email;
      admin.updatedAt = Date.now();

      await admin.save();

      const afterState = { ...admin.toObject() };

      // Log profile update
      await this.logAdminActivity(adminId, admin.email, 'PROFILE_UPDATE', 'ADMIN', adminId, admin.fullName, {
        description: 'Admin profile updated',
        before: beforeState,
        after: afterState
      });

      const populatedAdmin = await Admin.findById(adminId)
        .populate('role', 'name displayName permissions')
        .populate('createdBy', 'firstName lastName email');

      res.json({ success: true, data: populatedAdmin });
    } catch (error) {
      console.error('Error updating admin profile:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'PROFILE_UPDATE', 'ADMIN', req.admin.id, null, {
        description: 'Failed to update admin profile',
        error: error.message
      }, 'FAILED', 'CRITICAL');
      res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
  }

  // Change admin password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const adminId = req.admin.id;

      const admin = await Admin.findById(adminId);
      if (!admin) {
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }

      // Verify current password
      const isMatch = await admin.matchPassword(currentPassword);
      if (!isMatch) {
        await this.logAdminActivity(adminId, admin.email, 'PASSWORD_CHANGE', 'ADMIN', adminId, admin.fullName, {
          description: 'Password change attempt with incorrect current password'
        }, 'FAILED', 'HIGH');
        return res.status(400).json({ success: false, error: 'Current password is incorrect' });
      }

      // Update password
      admin.password = newPassword;
      admin.updatedAt = Date.now();
      await admin.save();

      // Log password change
      await this.logAdminActivity(adminId, admin.email, 'PASSWORD_CHANGE', 'ADMIN', adminId, admin.fullName, {
        description: 'Admin password changed successfully'
      }, 'SUCCESS', 'MEDIUM');

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      console.error('Error changing admin password:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'PASSWORD_CHANGE', 'ADMIN', req.admin.id, null, {
        description: 'Failed to change admin password',
        error: error.message
      }, 'FAILED', 'CRITICAL');
      res.status(500).json({ success: false, error: 'Failed to change password' });
    }
  }

  // Verify JWT token
  async verifyToken(req, res) {
    try {
      const admin = await Admin.findById(req.admin.id)
        .populate('role', 'name displayName permissions');

      if (!admin || !admin.isActive) {
        return res.status(401).json({ success: false, error: 'Invalid token or inactive admin' });
      }

      res.json({
        success: true,
        data: {
          admin: {
            id: admin._id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            role: admin.role,
            isActive: admin.isActive,
            lastLogin: admin.lastLogin
          }
        }
      });
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(500).json({ success: false, error: 'Token verification failed' });
    }
  }

  // Helper method to log admin activity
  async logAdminActivity(adminId, adminEmail, action, resource, resourceId, resourceName, details, status = 'SUCCESS', severity = 'MEDIUM') {
    try {
      const log = new AdminLog({
        adminId,
        adminName: adminEmail ? adminEmail.split('@')[0] : 'Unknown',
        adminEmail,
        action,
        resource,
        resourceId,
        resourceName,
        details,
        status,
        severity
      });

      await log.save();
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  }
}

module.exports = new AdminAuthController();
```

#### **3. Create AdminSettingsController** (`backend/controllers/adminSettingsController.js`)
```javascript
const Admin = require('../models/Admin');
const AdminLog = require('../models/AdminLog');
const User = require('../models/User');
const Report = require('../models/Report');
const Trip = require('../models/Trip');
const GasStation = require('../models/GasStation');

class AdminSettingsController {
  // Get dashboard settings
  async getDashboardSettings(req, res) {
    try {
      // For now, return default settings
      // In a real implementation, you might store these in a settings collection
      const settings = {
        widgets: {
          userStats: true,
          reportStats: true,
          tripStats: true,
          gasStationStats: true,
          recentActivity: true,
          systemHealth: true
        },
        refreshInterval: 30000, // 30 seconds
        theme: 'light',
        notifications: {
          newUsers: true,
          newReports: true,
          systemAlerts: true
        }
      };

      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'SETTINGS', null, null, {
        description: 'Retrieved dashboard settings'
      });

      res.json({ success: true, data: settings });
    } catch (error) {
      console.error('Error fetching dashboard settings:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'SETTINGS', null, null, {
        description: 'Failed to retrieve dashboard settings',
        error: error.message
      }, 'FAILED', 'HIGH');
      res.status(500).json({ success: false, error: 'Failed to fetch dashboard settings' });
    }
  }

  // Update dashboard settings
  async updateDashboardSettings(req, res) {
    try {
      const { widgets, refreshInterval, theme, notifications } = req.body;

      // In a real implementation, you would save these to a settings collection
      const settings = {
        widgets: widgets || {},
        refreshInterval: refreshInterval || 30000,
        theme: theme || 'light',
        notifications: notifications || {}
      };

      await this.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'SETTINGS', null, null, {
        description: 'Updated dashboard settings',
        settings: settings
      });

      res.json({ success: true, data: settings });
    } catch (error) {
      console.error('Error updating dashboard settings:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'SETTINGS', null, null, {
        description: 'Failed to update dashboard settings',
        error: error.message
      }, 'FAILED', 'CRITICAL');
      res.status(500).json({ success: false, error: 'Failed to update dashboard settings' });
    }
  }

  // Get system statistics
  async getSystemStats(req, res) {
    try {
      const [
        totalUsers,
        totalReports,
        totalTrips,
        totalGasStations,
        newUsersThisMonth,
        newReportsThisMonth,
        newTripsThisMonth,
        activeAdmins
      ] = await Promise.all([
        User.countDocuments(),
        Report.countDocuments(),
        Trip.countDocuments(),
        GasStation.countDocuments(),
        User.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
        Report.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
        Trip.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
        Admin.countDocuments({ isActive: true })
      ]);

      const stats = {
        totalUsers,
        totalReports,
        totalTrips,
        totalGasStations,
        newUsersThisMonth,
        newReportsThisMonth,
        newTripsThisMonth,
        activeAdmins,
        systemHealth: {
          database: 'healthy',
          api: 'healthy',
          uptime: process.uptime()
        }
      };

      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ANALYTICS', null, null, {
        description: 'Retrieved system statistics'
      });

      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching system stats:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ANALYTICS', null, null, {
        description: 'Failed to retrieve system statistics',
        error: error.message
      }, 'FAILED', 'HIGH');
      res.status(500).json({ success: false, error: 'Failed to fetch system stats' });
    }
  }

  // Get activity summary
  async getActivitySummary(req, res) {
    try {
      const { days = 7 } = req.query;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [
        totalLogs,
        successfulLogs,
        failedLogs,
        criticalLogs,
        recentActivity
      ] = await Promise.all([
        AdminLog.countDocuments({ timestamp: { $gte: startDate } }),
        AdminLog.countDocuments({ timestamp: { $gte: startDate }, status: 'SUCCESS' }),
        AdminLog.countDocuments({ timestamp: { $gte: startDate }, status: 'FAILED' }),
        AdminLog.countDocuments({ timestamp: { $gte: startDate }, severity: 'CRITICAL' }),
        AdminLog.find({ timestamp: { $gte: startDate } })
          .sort({ timestamp: -1 })
          .limit(10)
          .populate('adminId', 'firstName lastName email')
      ]);

      const summary = {
        totalLogs,
        successfulLogs,
        failedLogs,
        criticalLogs,
        successRate: totalLogs > 0 ? (successfulLogs / totalLogs) * 100 : 0,
        recentActivity
      };

      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ANALYTICS', null, null, {
        description: 'Retrieved activity summary',
        days: days
      });

      res.json({ success: true, data: summary });
    } catch (error) {
      console.error('Error fetching activity summary:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ANALYTICS', null, null, {
        description: 'Failed to retrieve activity summary',
        error: error.message
      }, 'FAILED', 'HIGH');
      res.status(500).json({ success: false, error: 'Failed to fetch activity summary' });
    }
  }

  // Reset admin password
  async resetAdminPassword(req, res) {
    try {
      const { adminId } = req.params;
      const { newPassword } = req.body;

      const admin = await Admin.findById(adminId);
      if (!admin) {
        await this.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'ADMIN', adminId, null, {
          description: 'Attempted to reset password for non-existent admin'
        }, 'FAILED', 'MEDIUM');
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }

      // Update password
      admin.password = newPassword;
      admin.updatedAt = Date.now();
      await admin.save();

      // Log password reset
      await this.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'ADMIN', adminId, admin.fullName, {
        description: `Password reset for admin: ${admin.email}`,
        targetAdmin: admin.email
      }, 'SUCCESS', 'HIGH');

      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error resetting admin password:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'ADMIN', req.params.adminId, null, {
        description: 'Failed to reset admin password',
        error: error.message
      }, 'FAILED', 'CRITICAL');
      res.status(500).json({ success: false, error: 'Failed to reset password' });
    }
  }

  // Helper method to log admin activity
  async logAdminActivity(adminId, adminEmail, action, resource, resourceId, resourceName, details, status = 'SUCCESS', severity = 'MEDIUM') {
    try {
      const log = new AdminLog({
        adminId,
        adminName: adminEmail ? adminEmail.split('@')[0] : 'Unknown',
        adminEmail,
        action,
        resource,
        resourceId,
        resourceName,
        details,
        status,
        severity
      });

      await log.save();
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  }
}

module.exports = new AdminSettingsController();
```

### **Phase 3: Routes (HIGH)**

#### **1. Create Admin Management Routes** (`backend/routes/adminManagement.js`)
```javascript
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateAdmin, checkPermission } = require('../middleware/adminAuth');

// Admin CRUD operations
router.get('/admins', authenticateAdmin, checkPermission('canRead'), adminController.getAdmins);
router.get('/admins/:id', authenticateAdmin, checkPermission('canRead'), adminController.getAdmin);
router.post('/admins', authenticateAdmin, checkPermission('canManageAdmins'), adminController.createAdmin);
router.put('/admins/:id', authenticateAdmin, checkPermission('canUpdate'), adminController.updateAdmin);
router.put('/admins/:id/role', authenticateAdmin, checkPermission('canAssignRoles'), adminController.updateAdminRole);
router.put('/admins/:id/deactivate', authenticateAdmin, checkPermission('canManageAdmins'), adminController.deactivateAdmin);
router.put('/admins/:id/activate', authenticateAdmin, checkPermission('canManageAdmins'), adminController.activateAdmin);

// Role management
router.get('/admin-roles', authenticateAdmin, checkPermission('canRead'), adminController.getAdminRoles);
router.post('/admin-roles', authenticateAdmin, checkPermission('canManageAdmins'), adminController.createAdminRole);

// Activity logging
router.get('/admin-logs', authenticateAdmin, checkPermission('canRead'), adminController.getAdminLogs);
router.get('/my-admin-logs', authenticateAdmin, adminController.getMyAdminLogs);

module.exports = router;
```

#### **2. Create Admin Auth Routes** (`backend/routes/adminAuth.js`)
```javascript
const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const { authenticateAdmin } = require('../middleware/adminAuth');

// Authentication routes
router.post('/login', adminAuthController.login);
router.post('/logout', authenticateAdmin, adminAuthController.logout);
router.get('/profile', authenticateAdmin, adminAuthController.getProfile);
router.put('/profile', authenticateAdmin, adminAuthController.updateProfile);
router.put('/change-password', authenticateAdmin, adminAuthController.changePassword);
router.get('/verify-token', authenticateAdmin, adminAuthController.verifyToken);

module.exports = router;
```

#### **3. Create Admin Settings Routes** (`backend/routes/adminSettings.js`)
```javascript
const express = require('express');
const router = express.Router();
const adminSettingsController = require('../controllers/adminSettingsController');
const { authenticateAdmin, checkPermission } = require('../middleware/adminAuth');

// Settings routes
router.get('/dashboard-settings', authenticateAdmin, adminSettingsController.getDashboardSettings);
router.put('/dashboard-settings', authenticateAdmin, adminSettingsController.updateDashboardSettings);
router.get('/system-stats', authenticateAdmin, checkPermission('canViewAnalytics'), adminSettingsController.getSystemStats);
router.get('/activity-summary', authenticateAdmin, checkPermission('canViewAnalytics'), adminSettingsController.getActivitySummary);
router.put('/reset-password/:adminId', authenticateAdmin, checkPermission('canManageAdmins'), adminSettingsController.resetAdminPassword);

module.exports = router;
```

### **Phase 4: Middleware (CRITICAL)**

#### **1. Create Admin Auth Middleware** (`backend/middleware/adminAuth.js`)
```javascript
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Authenticate admin
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).populate('role');
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Invalid token or inactive admin.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Check permission
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin || !req.admin.role || !req.admin.role.permissions) {
      return res.status(403).json({ error: 'Access denied. No permissions found.' });
    }

    if (!req.admin.role.permissions[permission]) {
      return res.status(403).json({ error: `Access denied. Required permission: ${permission}` });
    }

    next();
  };
};

module.exports = {
  authenticateAdmin,
  checkPermission
};
```

### **Phase 5: Default Data (CRITICAL)**

#### **1. Create Default Roles** (`backend/scripts/createDefaultRoles.js`)
```javascript
const AdminRole = require('../models/AdminRole');

const createDefaultRoles = async () => {
  try {
    const defaultRoles = [
      {
        name: 'super_admin',
        displayName: 'Super Administrator',
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
        },
        description: 'Full system access'
      },
      {
        name: 'admin',
        displayName: 'Administrator',
        permissions: {
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: false,
          canManageAdmins: false,
          canAssignRoles: false,
          canManageUsers: true,
          canManageReports: true,
          canManageTrips: true,
          canManageGasStations: true,
          canViewAnalytics: true,
          canExportData: true,
          canManageSettings: false
        },
        description: 'Standard administrator access'
      },
      {
        name: 'viewer',
        displayName: 'Viewer',
        permissions: {
          canCreate: false,
          canRead: true,
          canUpdate: false,
          canDelete: false,
          canManageAdmins: false,
          canAssignRoles: false,
          canManageUsers: false,
          canManageReports: false,
          canManageTrips: false,
          canManageGasStations: false,
          canViewAnalytics: true,
          canExportData: false,
          canManageSettings: false
        },
        description: 'Read-only access'
      }
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await AdminRole.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new AdminRole(roleData);
        await role.save();
        console.log(`Created role: ${role.displayName}`);
      } else {
        console.log(`Role already exists: ${roleData.displayName}`);
      }
    }

    console.log('Default roles created successfully');
  } catch (error) {
    console.error('Error creating default roles:', error);
  }
};

module.exports = createDefaultRoles;
```

#### **2. Create Default Admin** (`backend/scripts/createDefaultAdmin.js`)
```javascript
const Admin = require('../models/Admin');
const AdminRole = require('../models/AdminRole');

const createDefaultAdmin = async () => {
  try {
    // Check if default admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@trafficslight.com' });
    if (existingAdmin) {
      console.log('Default admin already exists');
      return;
    }

    // Get super admin role
    const superAdminRole = await AdminRole.findOne({ name: 'super_admin' });
    if (!superAdminRole) {
      console.error('Super admin role not found. Please create default roles first.');
      return;
    }

    // Create default admin
    const defaultAdmin = new Admin({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@trafficslight.com',
      password: 'admin123', // This will be hashed by the pre-save middleware
      role: superAdminRole._id,
      isActive: true,
      createdBy: null // System created
    });

    await defaultAdmin.save();
    console.log('Default admin created successfully');
    console.log('Email: admin@trafficslight.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

module.exports = createDefaultAdmin;
```

### **Phase 6: Update Main Server** (`backend/server.js`)

#### **Add Admin Routes to Main Server**
```javascript
// Add these routes to your main server.js file
const adminAuthRoutes = require('./routes/adminAuth');
const adminManagementRoutes = require('./routes/adminManagement');
const adminSettingsRoutes = require('./routes/adminSettings');

// Admin routes
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/admin-management', adminManagementRoutes);
app.use('/api/admin-settings', adminSettingsRoutes);
```

---

## 🚀 **IMPLEMENTATION CHECKLIST**

### **✅ BACKEND IMPLEMENTATION:**

#### **Phase 1: Models (CRITICAL)**
- [ ] **Create `Admin.js`** - Admin model with authentication
- [ ] **Create `AdminRole.js`** - Role model with permissions
- [ ] **Create `AdminLog.js`** - Activity logging model

#### **Phase 2: Controllers (HIGH)**
- [ ] **Create `adminController.js`** - Admin management controller
- [ ] **Create `adminAuthController.js`** - Authentication controller
- [ ] **Create `adminSettingsController.js`** - Settings controller

#### **Phase 3: Routes (HIGH)**
- [ ] **Create `adminManagement.js`** - Admin management routes
- [ ] **Create `adminAuth.js`** - Authentication routes
- [ ] **Create `adminSettings.js`** - Settings routes

#### **Phase 4: Middleware (CRITICAL)**
- [ ] **Create `adminAuth.js`** - Authentication middleware
- [ ] **Add routes to main server** - Update server.js

#### **Phase 5: Default Data (CRITICAL)**
- [ ] **Create default roles** - Super admin, admin, viewer
- [ ] **Create default admin** - System admin account
- [ ] **Test authentication** - Login/logout functionality

### **✅ FRONTEND IMPLEMENTATION:**

#### **Already Complete:**
- [x] **Admin Authentication Service** - `adminAuthService.js`
- [x] **Admin Settings Service** - `adminSettingsService.js`
- [x] **Admin Auth Context** - `AdminAuthContext.jsx`
- [x] **Protected Admin Routes** - `ProtectedAdminRoute.jsx`
- [x] **Admin Login Component** - `AdminLogin.jsx`
- [x] **Updated Admin Service** - Fixed API endpoints
- [x] **Updated Admin Management** - Fixed form structure
- [x] **Updated App.js** - Using AdminAuthProvider

---

## 🎯 **EXPECTED OUTCOME**

### **After Complete Implementation:**
- ✅ **Complete Admin System** - Full admin management functionality
- ✅ **Frontend Integration** - Seamless frontend-backend connection
- ✅ **Security** - JWT authentication and role-based permissions
- ✅ **Activity Tracking** - Complete admin action logging
- ✅ **Production Ready** - Scalable and secure admin system

**The system will be 100% aligned and ready for production deployment!** 🚀

---

## 📞 **NEXT STEPS**

### **Immediate Actions:**
1. **Implement Backend Models** - Create all 3 admin models
2. **Implement Backend Controllers** - Create all 3 admin controllers
3. **Implement Backend Routes** - Create all 21 admin endpoints
4. **Implement Backend Middleware** - Create authentication and permission middleware
5. **Create Default Data** - Set up default roles and admin account
6. **Test Integration** - Test frontend-backend integration

### **Testing:**
1. **Unit Tests** - Test all controllers and models
2. **Integration Tests** - Test all API endpoints
3. **Frontend Integration** - Test with frontend implementation
4. **Security Tests** - Test authentication and permissions

**This implementation plan provides everything needed to create a complete admin system!** ✅
