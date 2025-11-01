const User = require('../models/User');
const Motor = require('../models/Motor');
const Report = require('../models/Reports');
const GasStation = require('../models/GasStation');
const TripModel = require('../models/TripModel');
const FuelLogModel = require('../models/FuelLogModel');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

class UserController {
  // ============ USER PROFILE MANAGEMENT ============
  
  // Get all users (with pagination, filtering, and search)
  async getAllUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        city = '',
        province = '',
        barangay = '',
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter = {};

      // Search filter
      if (search) {
        filter.$or = [
          { firstName: new RegExp(search, 'i') },
          { lastName: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
          { name: new RegExp(search, 'i') }
        ];
      }

      // Location filters
      if (city) filter.city = new RegExp(city, 'i');
      if (province) filter.province = new RegExp(province, 'i');
      if (barangay) filter.barangay = new RegExp(barangay, 'i');

      // Active status filter
      if (isActive !== undefined) {
        filter.isActive = isActive === 'true' || isActive === true;
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get users with pagination
      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-password -resetPasswordToken -resetPasswordExpires -resetToken -resetTokenExpiry -verifyToken')
          .sort(sort)
          .limit(parseInt(limit))
          .skip(skip),
        User.countDocuments(filter)
      ]);

      // Transform users data
      const transformedUsers = users.map(user => ({
        _id: user._id,
        id: user._id,
        name: user.name || `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        street: user.street || '',
        barangay: user.barangay || '',
        city: user.city || '',
        province: user.province || '',
        isActive: user.isActive !== undefined ? user.isActive : true,
        isVerified: user.isVerified || false,
        preferences: user.preferences || {},
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        location: user.location || {}
      }));

      res.json({
        success: true,
        data: {
          users: transformedUsers,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            total: total,
            limit: parseInt(limit)
          },
          filters: {
            search,
            city,
            province,
            barangay,
            isActive
          }
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching users',
        error: error.message
      });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Server error getting profile' });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const updates = req.body;

      // Remove sensitive fields that shouldn't be updated directly
      delete updates.password;
      delete updates.email; // Email should be updated through a separate endpoint
      delete updates.role;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error updating profile' });
    }
  }

  // ============ USER PREFERENCES ============

  // Get user preferences
  async getPreferences(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const user = await User.findById(userId).select('preferences');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        success: true,
        preferences: user.preferences
      });
    } catch (error) {
      console.error('Get preferences error:', error);
      res.status(500).json({ message: 'Server error getting preferences' });
    }
  }

  // Update user preferences
  async updatePreferences(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const preferences = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { preferences } },
        { new: true, runValidators: true }
      ).select('preferences');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        success: true,
        preferences: user.preferences
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({ message: 'Server error updating preferences' });
    }
  }

  // ============ PASSWORD MANAGEMENT ============

  // Change password
  async changePassword(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error changing password' });
    }
  }

  // ============ USER STATISTICS & ANALYTICS ============

  // Get user statistics
  async getUserStats(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const { period = '30d' } = req.query;

      // Calculate date range
      const now = new Date();
      let startDate;
      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get user data
      const [trips, fuelLogs, motors, reports] = await Promise.all([
        TripModel.find({ userId, tripStartTime: { $gte: startDate } }),
        FuelLogModel.find({ userId, date: { $gte: startDate } }),
        Motor.find({ userId }),
        Report.find({ userId, createdAt: { $gte: startDate } })
      ]);

      // Calculate statistics
      const totalDistance = trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
      const totalFuelConsumed = fuelLogs.reduce((sum, log) => sum + (log.liters || 0), 0);
      const totalTrips = trips.length;
      const totalFuelLogs = fuelLogs.length;
      const totalMotors = motors.length;
      const totalReports = reports.length;

      // Calculate average values
      const averageTripDistance = totalTrips > 0 ? totalDistance / totalTrips : 0;
      const averageFuelPerTrip = totalTrips > 0 ? totalFuelConsumed / totalTrips : 0;

      res.json({
        success: true,
        stats: {
          period,
          totalDistance,
          totalFuelConsumed,
          totalTrips,
          totalFuelLogs,
          totalMotors,
          totalReports,
          averageTripDistance,
          averageFuelPerTrip,
          startDate,
          endDate: now
        }
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ message: 'Server error getting user statistics' });
    }
  }

  // Get user dashboard data
  async getDashboardData(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      // Simple test response first
      res.json({
        success: true,
        dashboard: {
          userId: userId,
          message: 'Dashboard data retrieved successfully',
          summary: {
            totalTrips: 0,
            totalDistance: 0,
            totalFuelConsumed: 0,
            totalMotors: 0
          }
        }
      });
    } catch (error) {
      console.error('Get dashboard data error:', error);
      res.status(500).json({ message: 'Server error getting dashboard data' });
    }
  }

  // ============ USER ACTIVITY & LOGS ============

  // Get user activity log
  async getActivityLog(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const { page = 1, limit = 20, type } = req.query;

      let activities = [];

      // Get different types of activities
      switch (type) {
        case 'trips':
          activities = await TripModel.find({ userId })
            .sort({ tripStartTime: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
          break;
        case 'fuel':
          activities = await FuelLogModel.find({ userId })
            .sort({ date: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
          break;
        case 'reports':
          activities = await Report.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
          break;
        default:
          // Get all activities (simplified)
          activities = await TripModel.find({ userId })
            .sort({ tripStartTime: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
      }

      res.json({
        success: true,
        activities,
        pagination: {
          current: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get activity log error:', error);
      res.status(500).json({ message: 'Server error getting activity log' });
    }
  }

  // ============ CACHE MANAGEMENT ============

  // Get cached data for user
  async getCachedData(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const { type } = req.query;

      let cachedData = {};

      switch (type) {
        case 'motors':
          const motors = await Motor.find({ userId }).sort({ createdAt: -1 });
          cachedData = { motors };
          break;
        case 'reports':
          const reports = await Report.find({ userId }).sort({ createdAt: -1 });
          cachedData = { reports };
          break;
        case 'gasStations':
          const gasStations = await GasStation.find().sort({ createdAt: -1 });
          cachedData = { gasStations };
          break;
        case 'trips':
          const trips = await TripModel.find({ userId }).sort({ tripStartTime: -1 });
          cachedData = { trips };
          break;
        case 'fuelLogs':
          const fuelLogs = await FuelLogModel.find({ userId }).sort({ date: -1 });
          cachedData = { fuelLogs };
          break;
        case 'all':
          const [allMotors, allReports, allGasStations, allTrips, allFuelLogs] = await Promise.all([
            Motor.find({ userId }).sort({ createdAt: -1 }),
            Report.find({ userId }).sort({ createdAt: -1 }),
            GasStation.find().sort({ createdAt: -1 }),
            TripModel.find({ userId }).sort({ tripStartTime: -1 }),
            FuelLogModel.find({ userId }).sort({ date: -1 })
          ]);
          cachedData = { 
            motors: allMotors, 
            reports: allReports, 
            gasStations: allGasStations,
            trips: allTrips,
            fuelLogs: allFuelLogs
          };
          break;
        default:
          return res.status(400).json({ message: 'Invalid cache type' });
      }

      res.json({
        success: true,
        cachedData
      });
    } catch (error) {
      console.error('Get cached data error:', error);
      res.status(500).json({ message: 'Server error getting cached data' });
    }
  }

  // Update cached data
  async updateCachedData(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const { type, data } = req.body;

      // This would typically update a cache store like Redis
      // For now, we'll just return success
      res.json({ 
        success: true,
        message: 'Cache updated successfully' 
      });
    } catch (error) {
      console.error('Update cached data error:', error);
      res.status(500).json({ message: 'Server error updating cached data' });
    }
  }

  // Clear user cache
  async clearCache(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const { type } = req.query;

      // This would typically clear cache entries from Redis
      // For now, we'll just return success
      res.json({ 
        success: true,
        message: 'Cache cleared successfully' 
      });
    } catch (error) {
      console.error('Clear cache error:', error);
      res.status(500).json({ message: 'Server error clearing cache' });
    }
  }

  // ============ USER SETTINGS ============

  // Get user settings
  async getSettings(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const user = await User.findById(userId).select('settings preferences');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        success: true,
        settings: user.settings || {},
        preferences: user.preferences || {}
      });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ message: 'Server error getting settings' });
    }
  }

  // Update user settings
  async updateSettings(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const { settings, preferences } = req.body;

      const updateData = {};
      if (settings) updateData.settings = settings;
      if (preferences) updateData.preferences = preferences;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('settings preferences');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        success: true,
        settings: user.settings,
        preferences: user.preferences
      });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ message: 'Server error updating settings' });
    }
  }

  // ============ USER NOTIFICATIONS ============

  // Get user notifications
  async getNotifications(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;

      // This would typically fetch from a notifications collection
      // For now, return a mock response
      res.json({
        success: true,
        notifications: [],
        pagination: {
          current: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: 'Server error getting notifications' });
    }
  }

  // Mark notification as read
  async markNotificationRead(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const { notificationId } = req.params;

      // This would typically update a notifications collection
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ message: 'Server error marking notification as read' });
    }
  }

  // ============ USER DATA EXPORT ============

  // Export user data
  async exportUserData(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const { format = 'json', include } = req.query;

      // Get all user data
      const [user, trips, fuelLogs, motors, reports] = await Promise.all([
        User.findById(userId).select('-password'),
        TripModel.find({ userId }),
        FuelLogModel.find({ userId }),
        Motor.find({ userId }),
        Report.find({ userId })
      ]);

      const exportData = {
        user: user,
        trips: trips,
        fuelLogs: fuelLogs,
        motors: motors,
        reports: reports,
        exportedAt: new Date(),
        totalRecords: trips.length + fuelLogs.length + motors.length + reports.length
      };

      res.json({
        success: true,
        data: exportData
      });
    } catch (error) {
      console.error('Export user data error:', error);
      res.status(500).json({ message: 'Server error exporting user data' });
    }
  }

  // ============ USER ACCOUNT MANAGEMENT ============

  // Deactivate user account
  async deactivateAccount(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const { reason } = req.body;

      await User.findByIdAndUpdate(userId, {
        isActive: false,
        deactivatedAt: new Date(),
        deactivationReason: reason
      });

      res.json({
        success: true,
        message: 'Account deactivated successfully'
      });
    } catch (error) {
      console.error('Deactivate account error:', error);
      res.status(500).json({ message: 'Server error deactivating account' });
    }
  }

  // Reactivate user account
  async reactivateAccount(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;

      await User.findByIdAndUpdate(userId, {
        isActive: true,
        reactivatedAt: new Date(),
        $unset: { deactivatedAt: 1, deactivationReason: 1 }
      });

      res.json({
        success: true,
        message: 'Account reactivated successfully'
      });
    } catch (error) {
      console.error('Reactivate account error:', error);
      res.status(500).json({ message: 'Server error reactivating account' });
    }
  }

  // Delete user account
  async deleteAccount(req, res) {
    try {
      const userId = req.user?.userId || req.params.userId;
      const { confirmation } = req.body;

      if (confirmation !== 'DELETE') {
        return res.status(400).json({ message: 'Confirmation required. Send "DELETE" as confirmation.' });
      }

      // Delete all user data
      await Promise.all([
        TripModel.deleteMany({ userId }),
        FuelLogModel.deleteMany({ userId }),
        Motor.deleteMany({ userId }),
        Report.deleteMany({ userId }),
        User.findByIdAndDelete(userId)
      ]);

      res.json({
        success: true,
        message: 'Account and all associated data deleted successfully'
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ message: 'Server error deleting account' });
    }
  }
}

module.exports = new UserController();
