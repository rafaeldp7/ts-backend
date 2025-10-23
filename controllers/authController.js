const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstName, lastName, phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        preferences: {
          units: 'metric',
          language: 'en',
          notifications: true
        }
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret-key-for-development',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret-key-for-development',
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          preferences: user.preferences
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }

  // Reset password request
  async resetPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret-key-for-development',
        { expiresIn: '1h' }
      );

      // TODO: Send email with reset link
      // For now, just return the token (in production, send via email)
      res.json({
        message: 'Password reset instructions sent to your email',
        resetToken // Remove this in production
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Server error during password reset' });
    }
  }

  // Verify reset token
  async verifyReset(req, res) {
    try {
      const { token } = req.body;

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-for-development');
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(400).json({ message: 'Invalid reset token' });
      }

      res.json({ message: 'Reset token is valid', userId: user._id });
    } catch (error) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      user.password = hashedPassword;
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error during password change' });
    }
  }

  // Logout
  async logout(req, res) {
    // In a stateless JWT system, logout is handled client-side
    // You could implement token blacklisting here if needed
    res.json({ message: 'Logged out successfully' });
  }

  // Verify token
  async verifyToken(req, res) {
    res.json({ 
      message: 'Token is valid', 
      user: {
        _id: req.user.userId,
        email: req.user.email
      }
    });
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error getting user profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get user growth data for admin dashboard
  async getUserGrowth(req, res) {
    try {
      const currentYear = new Date().getFullYear();
      
      // Aggregate user registrations by month for current year
      const monthlyData = await User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(currentYear, 0, 1), // Start of current year
              $lt: new Date(currentYear + 1, 0, 1) // Start of next year
            }
          }
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id": 1 }
        }
      ]);

      // Initialize array with 12 zeros (Jan-Dec)
      const result = new Array(12).fill(0);
      
      // Fill in actual data (month - 1 because array is 0-indexed)
      monthlyData.forEach(item => {
        result[item._id - 1] = item.count;
      });

      res.json({
        monthlyData: result
      });
    } catch (error) {
      console.error('Error fetching user growth data:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user growth data',
        message: error.message 
      });
    }
  }

  // Get user count
  async getUserCount(req, res) {
    try {
      const totalUsers = await User.countDocuments();
      const newUsersThisMonth = await User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      });

      res.json({
        totalUsers,
        newUsersThisMonth
      });
    } catch (error) {
      console.error('Error fetching user count:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user count',
        message: error.message 
      });
    }
  }

  // Get all users with pagination
  async getUsers(req, res) {
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

      const users = await User.find(filter)
        .select('-password')
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await User.countDocuments(filter);

      res.json({
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ 
        error: 'Failed to fetch users',
        message: error.message 
      });
    }
  }

  // Get first user name for dashboard
  async getFirstUserName(req, res) {
    try {
      const firstUser = await User.findOne().sort({ createdAt: 1 });
      
      if (!firstUser) {
        return res.json({ firstName: 'No users yet' });
      }

      res.json({ firstName: firstUser.firstName });
    } catch (error) {
      console.error('Error fetching first user name:', error);
      res.status(500).json({ 
        error: 'Failed to fetch first user name',
        message: error.message 
      });
    }
  }
}

module.exports = new AuthController();
