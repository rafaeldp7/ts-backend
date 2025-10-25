const Admin = require('../../../models/Admin');
const bcrypt = require('bcryptjs');

// Create first admin account (no authentication required)
const createFirstAdmin = async (req, res) => {
  try {
    // Check if any admins already exist
    const existingAdmins = await Admin.countDocuments();
    
    if (existingAdmins > 0) {
      return res.status(400).json({
        success: false,
        message: 'Admin accounts already exist. This endpoint is only for creating the first admin account.'
      });
    }

    const { firstName, lastName, email, password, role = 'super_admin' } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate role
    const validRoles = ['super_admin', 'admin', 'moderator'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: super_admin, admin, moderator'
      });
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'An admin with this email already exists'
      });
    }

    // Create the first admin
    const admin = new Admin({
      firstName,
      lastName,
      email,
      password, // Will be hashed by pre-save hook
      role,
      isActive: true,
      createdBy: null // No one created the first admin
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'First admin account created successfully',
      data: {
        admin: admin.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Create first admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create first admin account',
      error: error.message
    });
  }
};

// Check if first admin setup is needed
const checkSetupStatus = async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    
    res.json({
      success: true,
      data: {
        setupNeeded: adminCount === 0,
        adminCount,
        message: adminCount === 0 
          ? 'No admin accounts found. First admin setup is required.'
          : 'Admin accounts exist. Setup not needed.'
      }
    });
  } catch (error) {
    console.error('Check setup status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check setup status',
      error: error.message
    });
  }
};

// Get available roles for first admin setup
const getAvailableRoles = async (req, res) => {
  try {
    const roles = [
      {
        name: 'super_admin',
        displayName: 'Super Admin',
        level: 100,
        description: 'Full system access with all permissions',
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
        isActive: true,
        isSystem: true
      },
      {
        name: 'admin',
        displayName: 'Admin',
        level: 50,
        description: 'Standard administrative access with limited permissions',
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
        },
        isActive: true,
        isSystem: true
      },
      {
        name: 'moderator',
        displayName: 'Moderator',
        level: 25,
        description: 'Content moderation and read-only access',
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
        },
        isActive: true,
        isSystem: true
      }
    ];

    res.json({
      success: true,
      data: { roles }
    });
  } catch (error) {
    console.error('Get available roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available roles',
      error: error.message
    });
  }
};

module.exports = {
  createFirstAdmin,
  checkSetupStatus,
  getAvailableRoles
};
