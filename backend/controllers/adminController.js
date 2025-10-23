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
      res.status(500).json({
        success: false,
        error: 'Failed to fetch admins'
      });
    }
  }

  // Get single admin by ID
  async getAdmin(req, res) {
    try {
      const { id } = req.params;
      
      const admin = await Admin.findById(id)
        .populate('role', 'name displayName permissions')
        .populate('createdBy', 'firstName lastName email');

      if (!admin) {
        return res.status(404).json({
          success: false,
          error: 'Admin not found'
        });
      }

      // Log admin activity
      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ADMIN', id, admin.fullName, {
        description: 'Retrieved admin details'
      });

      res.json({
        success: true,
        data: admin
      });
    } catch (error) {
      console.error('Error fetching admin:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch admin'
      });
    }
  }

  // Create new admin
  async createAdmin(req, res) {
    try {
      const { firstName, lastName, email, password, roleId } = req.body;

      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          error: 'Admin with this email already exists'
        });
      }

      // Verify role exists
      const role = await AdminRole.findById(roleId);
      if (!role) {
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
        description: `Created new admin: ${admin.fullName}`,
        after: {
          email: admin.email,
          role: role.name
        }
      });

      res.status(201).json({
        success: true,
        data: populatedAdmin,
        message: 'Admin created successfully'
      });
    } catch (error) {
      console.error('Error creating admin:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create admin'
      });
    }
  }

  // Update admin
  async updateAdmin(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          error: 'Admin not found'
        });
      }

      const beforeData = {
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        isActive: admin.isActive
      };

      // Update fields
      Object.keys(updates).forEach(key => {
        if (key !== 'password' && key !== 'role' && updates[key] !== undefined) {
          admin[key] = updates[key];
        }
      });

      await admin.save();

      // Log admin activity
      await this.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'ADMIN', id, admin.fullName, {
        description: `Updated admin: ${admin.fullName}`,
        before: beforeData,
        after: {
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          isActive: admin.isActive
        }
      });

      res.json({
        success: true,
        data: admin,
        message: 'Admin updated successfully'
      });
    } catch (error) {
      console.error('Error updating admin:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update admin'
      });
    }
  }

  // Update admin role
  async updateAdminRole(req, res) {
    try {
      const { id } = req.params;
      const { roleId } = req.body;

      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          error: 'Admin not found'
        });
      }

      const role = await AdminRole.findById(roleId);
      if (!role) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role specified'
        });
      }

      const oldRole = await AdminRole.findById(admin.role);
      admin.role = roleId;
      await admin.save();

      // Log admin activity
      await this.logAdminActivity(req.admin.id, req.admin.email, 'ASSIGN_ROLE', 'ADMIN', id, admin.fullName, {
        description: `Changed admin role from ${oldRole?.name} to ${role.name}`,
        before: { role: oldRole?.name },
        after: { role: role.name }
      });

      res.json({
        success: true,
        message: 'Admin role updated successfully'
      });
    } catch (error) {
      console.error('Error updating admin role:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update admin role'
      });
    }
  }

  // Deactivate admin
  async deactivateAdmin(req, res) {
    try {
      const { id } = req.params;

      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          error: 'Admin not found'
        });
      }

      admin.isActive = false;
      await admin.save();

      // Log admin activity
      await this.logAdminActivity(req.admin.id, req.admin.email, 'DEACTIVATE', 'ADMIN', id, admin.fullName, {
        description: `Deactivated admin: ${admin.fullName}`
      });

      res.json({
        success: true,
        message: 'Admin deactivated successfully'
      });
    } catch (error) {
      console.error('Error deactivating admin:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to deactivate admin'
      });
    }
  }

  // Get admin roles
  async getAdminRoles(req, res) {
    try {
      const roles = await AdminRole.find({ isActive: true })
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      console.error('Error fetching admin roles:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch admin roles'
      });
    }
  }

  // Create admin role
  async createAdminRole(req, res) {
    try {
      const { name, displayName, permissions, description } = req.body;

      // Check if role already exists
      const existingRole = await AdminRole.findOne({ name });
      if (existingRole) {
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
      await this.logAdminActivity(req.admin.id, req.admin.email, 'CREATE', 'ADMIN', null, 'Admin Role', {
        description: `Created new admin role: ${displayName}`,
        after: { name, displayName, permissions }
      });

      res.status(201).json({
        success: true,
        data: role,
        message: 'Admin role created successfully'
      });
    } catch (error) {
      console.error('Error creating admin role:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create admin role'
      });
    }
  }

  // Get admin activity logs
  async getAdminLogs(req, res) {
    try {
      const { page = 1, limit = 20, adminId, action, resource, startDate, endDate } = req.query;
      
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
        .populate('adminId', 'firstName lastName email')
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await AdminLog.countDocuments(filter);

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
      res.status(500).json({
        success: false,
        error: 'Failed to fetch admin logs'
      });
    }
  }

  // Get current admin's activity logs
  async getMyAdminLogs(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      
      const logs = await AdminLog.find({ adminId: req.admin.id })
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await AdminLog.countDocuments({ adminId: req.admin.id });

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
      res.status(500).json({
        success: false,
        error: 'Failed to fetch admin logs'
      });
    }
  }

  // Helper method to log admin activity
  async logAdminActivity(adminId, adminEmail, action, resource, resourceId, resourceName, details = {}) {
    try {
      const log = new AdminLog({
        adminId,
        adminName: details.adminName || 'System',
        adminEmail,
        action,
        resource,
        resourceId,
        resourceName,
        details,
        ipAddress: details.ipAddress,
        userAgent: details.userAgent,
        sessionId: details.sessionId,
        severity: details.severity || 'LOW',
        status: details.status || 'SUCCESS'
      });

      await log.save();
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  }
}

module.exports = new AdminController();