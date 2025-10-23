const Admin = require('../models/Admin');
const AdminRole = require('../models/AdminRole');
const AdminLog = require('../models/AdminLog');

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
      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN', null, null, {
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
      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN', null, null, {
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
        await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN', req.params.id, null, {
          description: 'Attempted to retrieve non-existent admin'
        }, 'FAILED', 'MEDIUM');
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }

      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN', admin._id, admin.fullName, {
        description: 'Retrieved single admin details'
      });

      res.json({ success: true, data: admin });
    } catch (error) {
      console.error('Error fetching admin:', error);
      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN', req.params.id, null, {
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
        await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'CREATE', 'ADMIN', null, email, {
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
        await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'CREATE', 'ADMIN', null, email, {
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
      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'CREATE', 'ADMIN', admin._id, admin.fullName, {
        description: 'New admin account created',
        newAdminEmail: admin.email,
        assignedRole: role.displayName
      });

      res.status(201).json({ success: true, data: populatedAdmin });
    } catch (error) {
      console.error('Error creating admin:', error);
      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'CREATE', 'ADMIN', null, req.body.email, {
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
        await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'ADMIN', adminId, null, {
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
          await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'ADMIN', adminId, admin.fullName, {
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
          await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'ADMIN', adminId, admin.fullName, {
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
      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'ADMIN', admin._id, admin.fullName, {
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
      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'ADMIN', req.params.id, null, {
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
        await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'ASSIGN_ROLE', 'ADMIN', adminId, null, {
          description: 'Attempted to assign role to non-existent admin'
        }, 'FAILED', 'MEDIUM');
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }

      const beforeRole = admin.role.toString();

      const newRole = await AdminRole.findById(roleId);
      if (!newRole) {
        await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'ASSIGN_ROLE', 'ADMIN', adminId, admin.fullName, {
          description: 'Attempted to assign invalid role',
          roleId
        }, 'FAILED', 'MEDIUM');
        return res.status(400).json({ success: false, error: 'Invalid role specified' });
      }

      admin.role = roleId;
      admin.updatedAt = Date.now();
      await admin.save();

      // Log admin activity
      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'ASSIGN_ROLE', 'ADMIN', admin._id, admin.fullName, {
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
      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'ASSIGN_ROLE', 'ADMIN', req.params.id, null, {
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
        await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'DEACTIVATE', 'ADMIN', adminId, null, {
          description: 'Attempted to deactivate non-existent admin'
        }, 'FAILED', 'MEDIUM');
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }

      if (admin._id.toString() === req.admin.id.toString()) {
        await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'DEACTIVATE', 'ADMIN', adminId, admin.fullName, {
          description: 'Attempted to deactivate own admin account'
        }, 'FAILED', 'HIGH');
        return res.status(400).json({ success: false, error: 'Cannot deactivate your own account' });
      }

      admin.isActive = false;
      admin.updatedAt = Date.now();
      await admin.save();

      // Log admin activity
      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'DEACTIVATE', 'ADMIN', admin._id, admin.fullName, {
        description: 'Admin account deactivated'
      });

      const populatedAdmin = await Admin.findById(admin._id)
        .populate('role', 'name displayName permissions')
        .populate('createdBy', 'firstName lastName email');

      res.json({ success: true, data: populatedAdmin });
    } catch (error) {
      console.error('Error deactivating admin:', error);
      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'DEACTIVATE', 'ADMIN', req.params.id, null, {
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
        await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'ACTIVATE', 'ADMIN', adminId, null, {
          description: 'Attempted to activate non-existent admin'
        }, 'FAILED', 'MEDIUM');
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }

      admin.isActive = true;
      admin.updatedAt = Date.now();
      await admin.save();

      // Log admin activity
      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'ACTIVATE', 'ADMIN', admin._id, admin.fullName, {
        description: 'Admin account activated'
      });

      const populatedAdmin = await Admin.findById(admin._id)
        .populate('role', 'name displayName permissions')
        .populate('createdBy', 'firstName lastName email');

      res.json({ success: true, data: populatedAdmin });
    } catch (error) {
      console.error('Error activating admin:', error);
      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'ACTIVATE', 'ADMIN', req.params.id, null, {
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

      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN_ROLE', null, null, {
        description: 'Retrieved admin roles list'
      });

      res.json({ success: true, data: roles });
    } catch (error) {
      console.error('Error fetching admin roles:', error);
      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN_ROLE', null, null, {
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
        await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'CREATE', 'ADMIN_ROLE', null, name, {
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
      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'CREATE', 'ADMIN_ROLE', role._id, role.displayName, {
        description: 'New admin role created',
        roleName: role.name,
        permissions: role.permissions
      });

      res.status(201).json({ success: true, data: role });
    } catch (error) {
      console.error('Error creating admin role:', error);
      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'CREATE', 'ADMIN_ROLE', null, req.body.name, {
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

      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN_LOG', null, null, {
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
      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN_LOG', null, null, {
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

      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN_LOG', null, null, {
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
      await AdminController.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN_LOG', null, null, {
        description: 'Failed to retrieve personal admin logs',
        error: error.message
      }, 'FAILED', 'HIGH');
      res.status(500).json({ success: false, error: 'Failed to fetch my admin logs' });
    }
  }

  // Helper method to log admin activity
  static async logAdminActivity(adminId, adminEmail, action, resource, resourceId, resourceName, details, status = 'SUCCESS', severity = 'MEDIUM') {
    try {
      // Only log if we have a valid adminId
      if (!adminId) {
        return; // Skip logging if no adminId
      }

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

module.exports = new AdminController();