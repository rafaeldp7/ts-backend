const User = require('../../../models/User');
const bcrypt = require('bcryptjs');

// Get all users (admin only)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, city, barangay, isActive } = req.query;

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
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

// Get single user
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, city, province, barangay, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: user.toObject() }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
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

    res.json({
      success: true,
      data: {
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
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
      error: error.message
    });
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

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get users by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users by location',
      error: error.message
    });
  }
};

// Create user (admin only)
const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, city, province, barangay } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
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

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: user.toObject() }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
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
