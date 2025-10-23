const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const AdminLog = require('../models/AdminLog');

class AdminAuthController {
  // Admin login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Find admin by email
      const admin = await Admin.findOne({ email })
        .populate('role', 'name displayName permissions')
        .select('+password');

      if (!admin) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check if admin is active
      if (!admin.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account is deactivated. Please contact administrator.'
        });
      }

      // Verify password
      const isPasswordValid = await admin.comparePassword(password);
      if (!isPasswordValid) {
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
        { 
          id: admin._id, 
          email: admin.email,
          role: admin.role.name,
          permissions: admin.role.permissions
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Log admin login
      await this.logAdminActivity(admin._id, admin.email, 'LOGIN', 'SYSTEM', null, 'System Login', {
        description: 'Admin logged in successfully',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        sessionId: req.sessionID || null,
        severity: 'LOW',
        status: 'SUCCESS'
      });

      // Remove password from response
      const adminResponse = admin.toJSON();
      delete adminResponse.password;

      res.json({
        success: true,
        data: {
          admin: adminResponse,
          token,
          expiresIn: '24h'
        },
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  }

  // Admin logout
  async logout(req, res) {
    try {
      const adminId = req.admin?.id;
      const adminEmail = req.admin?.email;

      if (adminId) {
        // Log admin logout
        await this.logAdminActivity(adminId, adminEmail, 'LOGOUT', 'SYSTEM', null, 'System Logout', {
          description: 'Admin logged out successfully',
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          sessionId: req.sessionID || null,
          severity: 'LOW',
          status: 'SUCCESS'
        });
      }

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Admin logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  }

  // Get current admin profile
  async getProfile(req, res) {
    try {
      const admin = await Admin.findById(req.admin.id)
        .populate('role', 'name displayName permissions')
        .populate('createdBy', 'firstName lastName email');

      if (!admin) {
        return res.status(404).json({
          success: false,
          error: 'Admin not found'
        });
      }

      res.json({
        success: true,
        data: admin
      });
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch profile'
      });
    }
  }

  // Update admin profile
  async updateProfile(req, res) {
    try {
      const { firstName, lastName, email } = req.body;
      const admin = await Admin.findById(req.admin.id);

      if (!admin) {
        return res.status(404).json({
          success: false,
          error: 'Admin not found'
        });
      }

      const beforeData = {
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email
      };

      // Update fields
      if (firstName) admin.firstName = firstName;
      if (lastName) admin.lastName = lastName;
      if (email) admin.email = email;

      await admin.save();

      // Log profile update
      await this.logAdminActivity(admin._id, admin.email, 'PROFILE_UPDATE', 'ADMIN', admin._id, admin.fullName, {
        description: 'Admin profile updated',
        before: beforeData,
        after: {
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        sessionId: req.sessionID || null,
        severity: 'MEDIUM',
        status: 'SUCCESS'
      });

      res.json({
        success: true,
        data: admin,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating admin profile:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }

  // Change admin password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 6 characters long'
        });
      }

      const admin = await Admin.findById(req.admin.id).select('+password');

      if (!admin) {
        return res.status(404).json({
          success: false,
          error: 'Admin not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Update password
      admin.password = newPassword;
      await admin.save();

      // Log password change
      await this.logAdminActivity(admin._id, admin.email, 'PASSWORD_CHANGE', 'ADMIN', admin._id, admin.fullName, {
        description: 'Admin password changed',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        sessionId: req.sessionID || null,
        severity: 'HIGH',
        status: 'SUCCESS'
      });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to change password'
      });
    }
  }

  // Verify admin token
  async verifyToken(req, res) {
    try {
      const admin = await Admin.findById(req.admin.id)
        .populate('role', 'name displayName permissions');

      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or inactive admin account'
        });
      }

      res.json({
        success: true,
        data: {
          admin,
          permissions: admin.role.permissions
        }
      });
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(500).json({
        success: false,
        error: 'Token verification failed'
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

module.exports = new AdminAuthController();
