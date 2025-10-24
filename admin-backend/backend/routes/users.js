const express = require('express');
const router = express.Router();
const User = require('../../../models/User');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

// Get all users (admin only)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, city, barangay, isActive } = req.query;
    
    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (barangay) filter['address.barangay'] = new RegExp(barangay, 'i');
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

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== 'password') {
        user[key] = req.body[key];
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: user.getPublicProfile() }
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

// Delete user (admin only)
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
    const stats = await User.getUserStats();
    const usersByLocation = await User.aggregate([
      {
        $group: {
          _id: {
            city: '$address.city',
            barangay: '$address.barangay'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          verifiedUsers: 0,
          avgTrips: 0,
          avgDistance: 0
        },
        byLocation: usersByLocation
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
    const { city, barangay } = req.query;
    
    if (!city || !barangay) {
      return res.status(400).json({
        success: false,
        message: 'City and barangay are required'
      });
    }

    const users = await User.findByLocation(city, barangay);

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

// Routes
router.get('/', authenticateAdmin, getUsers);
router.get('/stats', authenticateAdmin, getUserStats);
router.get('/location', authenticateAdmin, getUsersByLocation);
router.get('/:id', authenticateAdmin, getUser);
router.put('/:id', authenticateAdmin, updateUser);
router.delete('/:id', authenticateAdmin, deleteUser);

module.exports = router;
