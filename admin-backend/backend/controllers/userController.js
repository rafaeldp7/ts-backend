const User = require('../../../models/User');
const bcrypt = require('bcryptjs');
const { logAdminAction } = require('./adminLogsController');
const { sendErrorResponse, sendSuccessResponse } = require('../middleware/validation');

// Get all users (admin only)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 1000, search, city, barangay, isActive } = req.query;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { name: new RegExp(search, 'i') }
      ];
    }
    if (city) filter['city'] = new RegExp(city, 'i');
    if (barangay) filter['barangay'] = new RegExp(barangay, 'i');
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpires -resetToken -resetTokenExpiry -verifyToken')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    // Transform users data to include all needed fields for frontend
    const transformedUsers = users.map(user => ({
      _id: user._id,
      id: user.id || user._id,
      name: user.name || `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      barangay: user.barangay,
      street: user.street,
      city: user.city,
      province: user.province,
      isActive: user.isActive,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      created_at: user.createdAt,
      location: user.location || {}
    }));

    sendSuccessResponse(res, {
      users: transformedUsers,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    sendErrorResponse(res, 500, 'Failed to get users', error);
  }
};

// Get single user
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    sendSuccessResponse(res, { user });
  } catch (error) {
    console.error('Get user error:', error);
    sendErrorResponse(res, 500, 'Failed to get user', error);
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, city, province, barangay, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    // Store original data for logging
    const originalData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      city: user.city,
      province: user.province,
      barangay: user.barangay,
      isActive: user.isActive
    };

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (city) user.city = city;
    if (province) user.province = province;
    if (barangay) user.barangay = barangay;
    if (isActive !== undefined) user.isActive = isActive;

    // Update name if firstName or lastName changed
    if (firstName || lastName) {
      user.name = `${user.firstName} ${user.lastName}`;
    }

    await user.save();

    // Log the user update action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'UPDATE',
        'USER',
        {
          description: `Updated user: ${user.firstName} ${user.lastName} (${user.email})`,
          userId: user._id,
          userName: `${user.firstName} ${user.lastName}`,
          userEmail: user.email,
          changes: {
            before: originalData,
            after: {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
              city: user.city,
              province: user.province,
              barangay: user.barangay,
              isActive: user.isActive
            }
          }
        },
        req
      );
    }

    sendSuccessResponse(res, { user: user.toObject() }, 'User updated successfully');
  } catch (error) {
    console.error('Update user error:', error);
    sendErrorResponse(res, 500, 'Failed to update user', error);
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    // Store user data for logging before deletion
    const deletedUserData = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      city: user.city,
      barangay: user.barangay
    };

    await User.findByIdAndDelete(req.params.id);

    // Log the user deletion action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'DELETE',
        'USER',
        {
          description: `Deleted user: ${deletedUserData.name} (${deletedUserData.email})`,
          userId: deletedUserData.id,
          userName: deletedUserData.name,
          userEmail: deletedUserData.email,
          userCity: deletedUserData.city,
          userBarangay: deletedUserData.barangay
        },
        req
      );
    }

    sendSuccessResponse(res, null, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    sendErrorResponse(res, 500, 'Failed to delete user', error);
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    // Get users by city
    const usersByCity = await User.aggregate([
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get users by province
    const usersByProvince = await User.aggregate([
      {
        $group: {
          _id: '$province',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    sendSuccessResponse(res, {
      overall: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        newUsersThisMonth
      },
      distribution: {
        byCity: usersByCity,
        byProvince: usersByProvince
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    sendErrorResponse(res, 500, 'Failed to get user statistics', error);
  }
};

// Get users by location
const getUsersByLocation = async (req, res) => {
  try {
    const { city, province, barangay } = req.query;

    const filter = {};
    if (city) filter.city = new RegExp(city, 'i');
    if (province) filter.province = new RegExp(province, 'i');
    if (barangay) filter.barangay = new RegExp(barangay, 'i');

    const users = await User.find(filter)
      .select('firstName lastName email city province barangay createdAt')
      .sort({ createdAt: -1 });

    sendSuccessResponse(res, { users });
  } catch (error) {
    console.error('Get users by location error:', error);
    sendErrorResponse(res, 500, 'Failed to get users by location', error);
  }
};

// Create user (admin only)
const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, city, province, barangay } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendErrorResponse(res, 400, 'User with this email already exists');
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password, // Will be hashed by pre-save hook
      phone: phone || '',
      city: city || 'Default City',
      province: province || 'Default Province',
      barangay: barangay || 'Default Barangay',
      name: `${firstName} ${lastName}`,
      preferences: {
        units: 'metric',
        language: 'en',
        notifications: true
      }
    });

    await user.save();

    // Log the user creation action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'CREATE',
        'USER',
        {
          description: `Created new user: ${user.firstName} ${user.lastName} (${user.email})`,
          userId: user._id,
          userName: `${user.firstName} ${user.lastName}`,
          userEmail: user.email,
          userCity: user.city,
          userBarangay: user.barangay
        },
        req
      );
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: user.toObject() }
    });
  } catch (error) {
    console.error('Create user error:', error);
    sendErrorResponse(res, 500, 'Failed to create user', error);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  getUsersByLocation
};
