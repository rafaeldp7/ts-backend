const Admin = require('../models/Admin');
const AdminRole = require('../models/AdminRole');
const User = require('../models/User');

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
      .populate('role', 'name displayName permissions')
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Admin.countDocuments(filter);

    res.json({
      success: true,
      data: {
        admins,
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
      .populate('role', 'name displayName permissions')
      .select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      data: { admin }
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

    await admin.populate('role', 'name displayName permissions');

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

    await admin.populate('role', 'name displayName permissions');

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
    if (admin._id.toString() === req.user?.id) {
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

// Get admin roles
const getAdminRoles = async (req, res) => {
  try {
    const roles = await AdminRole.find({ isActive: true })
      .sort({ level: -1 });

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

// Create admin role
const createAdminRole = async (req, res) => {
  try {
    const roleData = {
      ...req.body,
      createdBy: req.user?.id || null
    };

    const role = new AdminRole(roleData);
    await role.save();

    res.status(201).json({
      success: true,
      message: 'Admin role created successfully',
      data: { role }
    });
  } catch (error) {
    console.error('Create admin role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin role',
      error: error.message
    });
  }
};

// Update admin role
const updateAdminRole = async (req, res) => {
  try {
    const role = await AdminRole.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Admin role not found'
      });
    }

    // Prevent modification of system roles
    if (role.isSystem) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify system role'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        role[key] = req.body[key];
      }
    });

    role.updatedBy = req.user?.id || null;
    await role.save();

    res.json({
      success: true,
      message: 'Admin role updated successfully',
      data: { role }
    });
  } catch (error) {
    console.error('Update admin role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin role',
      error: error.message
    });
  }
};

// Delete admin role
const deleteAdminRole = async (req, res) => {
  try {
    const role = await AdminRole.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Admin role not found'
      });
    }

    // Prevent deletion of system roles
    if (role.isSystem) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete system role'
      });
    }

    // Check if role is in use
    const adminsUsingRole = await Admin.countDocuments({ role: req.params.id });
    if (adminsUsingRole > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete role that is currently in use'
      });
    }

    await AdminRole.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Admin role deleted successfully'
    });
  } catch (error) {
    console.error('Delete admin role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin role',
      error: error.message
    });
  }
};

// Get admin statistics
const getAdminStats = async (req, res) => {
  try {
    const totalAdmins = await Admin.countDocuments();
    const activeAdmins = await Admin.countDocuments({ isActive: true });
    const verifiedAdmins = await Admin.countDocuments({ isVerified: true });
    
    const avgLogins = await Admin.aggregate([
      { $group: { _id: null, avgLogins: { $avg: '$loginCount' } } }
    ]);

    const roleDistribution = await Admin.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'adminroles',
          localField: '_id',
          foreignField: '_id',
          as: 'role'
        }
      },
      { $unwind: '$role' },
      {
        $project: {
          role: {
            name: 1,
            displayName: 1
          },
          count: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overall: {
          totalAdmins,
          activeAdmins,
          verifiedAdmins,
          avgLogins: avgLogins[0]?.avgLogins || 0
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
  createAdminRole,
  updateAdminRole,
  deleteAdminRole,
  getAdminStats
};
