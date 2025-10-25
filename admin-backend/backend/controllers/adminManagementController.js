const Admin = require('../../../models/Admin');
const User = require('../../../models/User');

// Get all admins
const getAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;
    
    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const admins = await Admin.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Add role info to each admin
    const adminsWithRoleInfo = admins.map(admin => {
      const adminObj = admin.toObject();
      adminObj.roleInfo = admin.getRoleInfo();
      return adminObj;
    });

    const total = await Admin.countDocuments(filter);

    res.json({
      success: true,
      data: {
        admins: adminsWithRoleInfo,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admins',
      error: error.message
    });
  }
};

// Get single admin
const getAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Add role info to admin
    const adminObj = admin.toObject();
    adminObj.roleInfo = admin.getRoleInfo();

    res.json({
      success: true,
      data: { admin: adminObj }
    });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin',
      error: error.message
    });
  }
};

// Create new admin
const createAdmin = async (req, res) => {
  try {
    const adminData = {
      ...req.body,
      createdBy: req.user?.id || null
    };

    const admin = new Admin(adminData);
    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: { admin: admin.getPublicProfile() }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: error.message
    });
  }
};

// Update admin
const updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== 'password') {
        admin[key] = req.body[key];
      }
    });

    admin.updatedBy = req.user?.id || null;
    await admin.save();

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: { admin: admin.getPublicProfile() }
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin',
      error: error.message
    });
  }
};

// Delete admin
const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent deletion of self
    if (req.user?.id && admin._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await Admin.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin',
      error: error.message
    });
  }
};

// Get admin roles (3 fixed roles)
const getAdminRoles = async (req, res) => {
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
    console.error('Get admin roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin roles',
      error: error.message
    });
  }
};

// Get admin statistics
const getAdminStats = async (req, res) => {
  try {
    const totalAdmins = await Admin.countDocuments();
    const activeAdmins = await Admin.countDocuments({ isActive: true });

    // Get role distribution
    const roleDistribution = await Admin.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          role: '$_id',
          count: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overall: {
          totalAdmins,
          activeAdmins
        },
        roleDistribution
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminRoles,
  getAdminStats
};