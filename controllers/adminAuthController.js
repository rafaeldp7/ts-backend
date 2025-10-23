const Admin = require('../models/Admin');
const AdminLog = require('../models/AdminLog');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

class AdminAuthController {
  // Admin login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find admin by email
      const admin = await Admin.findOne({ email }).populate('role', 'name displayName permissions');
      
      if (!admin) {
        await AdminAuthController.logAdminActivity(null, email, 'LOGIN', 'ADMIN', null, null, {
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
        await AdminAuthController.logAdminActivity(admin._id, admin.email, 'LOGIN', 'ADMIN', null, null, {
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
        await AdminAuthController.logAdminActivity(admin._id, admin.email, 'LOGIN', 'ADMIN', null, null, {
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
        process.env.JWT_SECRET || 'fallback-secret-key-for-development',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      // Log successful login
      await AdminAuthController.logAdminActivity(admin._id, admin.email, 'LOGIN', 'ADMIN', null, null, {
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
      await AdminAuthController.logAdminActivity(null, req.body.email, 'LOGIN', 'ADMIN', null, null, {
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
      await AdminAuthController.logAdminActivity(req.admin?.id, req.admin?.email, 'LOGOUT', 'ADMIN', null, null, {
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
      const admin = await Admin.findById(req.admin?.id)
        .populate('role', 'name displayName permissions')
        .populate('createdBy', 'firstName lastName email');

      if (!admin) {
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }

      // Log profile access
      await AdminAuthController.logAdminActivity(req.admin?.id, req.admin?.email, 'READ', 'ADMIN', req.admin?.id, admin.fullName, {
        description: 'Retrieved admin profile'
      });

      res.json({ success: true, data: admin });
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      await AdminAuthController.logAdminActivity(req.admin?.id, req.admin?.email, 'READ', 'ADMIN', req.admin?.id, null, {
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
      const adminId = req.admin?.id;

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
          await AdminAuthController.logAdminActivity(adminId, admin.email, 'UPDATE', 'ADMIN', adminId, admin.fullName, {
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
      await AdminAuthController.logAdminActivity(adminId, admin.email, 'PROFILE_UPDATE', 'ADMIN', adminId, admin.fullName, {
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
      await AdminAuthController.logAdminActivity(req.admin?.id, req.admin?.email, 'PROFILE_UPDATE', 'ADMIN', req.admin?.id, null, {
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
      const adminId = req.admin?.id;

      const admin = await Admin.findById(adminId);
      if (!admin) {
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }

      // Verify current password
      const isMatch = await admin.matchPassword(currentPassword);
      if (!isMatch) {
        await AdminAuthController.logAdminActivity(adminId, admin.email, 'PASSWORD_CHANGE', 'ADMIN', adminId, admin.fullName, {
          description: 'Password change attempt with incorrect current password'
        }, 'FAILED', 'HIGH');
        return res.status(400).json({ success: false, error: 'Current password is incorrect' });
      }

      // Update password
      admin.password = newPassword;
      admin.updatedAt = Date.now();
      await admin.save();

      // Log password change
      await AdminAuthController.logAdminActivity(adminId, admin.email, 'PASSWORD_CHANGE', 'ADMIN', adminId, admin.fullName, {
        description: 'Admin password changed successfully'
      }, 'SUCCESS', 'MEDIUM');

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      console.error('Error changing admin password:', error);
      await AdminAuthController.logAdminActivity(req.admin?.id, req.admin?.email, 'PASSWORD_CHANGE', 'ADMIN', req.admin?.id, null, {
        description: 'Failed to change admin password',
        error: error.message
      }, 'FAILED', 'CRITICAL');
      res.status(500).json({ success: false, error: 'Failed to change password' });
    }
  }

  // Verify JWT token
  async verifyToken(req, res) {
    try {
      const admin = await Admin.findById(req.admin?.id)
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

  // Static method to log admin activity
  static async logAdminActivity(adminId, adminEmail, action, resource, resourceId, resourceName, details, status = 'SUCCESS', severity = 'MEDIUM') {
    try {
      // Only log if we have a valid adminId or if it's a system action
      if (!adminId && action !== 'LOGIN') {
        return; // Skip logging if no adminId and not a login attempt
      }

      const log = new AdminLog({
        adminId: adminId || new mongoose.Types.ObjectId(), // Use a dummy ObjectId if none provided
        adminName: adminEmail ? adminEmail.split('@')[0] : 'System',
        adminEmail: adminEmail || 'system@trafficslight.com',
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