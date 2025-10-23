const User = require('../models/User');
const Motor = require('../models/Motor');
const Report = require('../models/Reports');
const GasStation = require('../models/GasStation');

class UserController {
  // Get user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Server error getting profile' });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const updates = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error updating profile' });
    }
  }

  // Get user preferences
  async getPreferences(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId).select('preferences');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user.preferences);
    } catch (error) {
      console.error('Get preferences error:', error);
      res.status(500).json({ message: 'Server error getting preferences' });
    }
  }

  // Update user preferences
  async updatePreferences(req, res) {
    try {
      const userId = req.user.userId;
      const preferences = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { preferences } },
        { new: true, runValidators: true }
      ).select('preferences');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user.preferences);
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({ message: 'Server error updating preferences' });
    }
  }

  // Get cached data for user
  async getCachedData(req, res) {
    try {
      const userId = req.user.userId;
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
        case 'all':
          const [allMotors, allReports, allGasStations] = await Promise.all([
            Motor.find({ userId }).sort({ createdAt: -1 }),
            Report.find({ userId }).sort({ createdAt: -1 }),
            GasStation.find().sort({ createdAt: -1 })
          ]);
          cachedData = { motors: allMotors, reports: allReports, gasStations: allGasStations };
          break;
        default:
          return res.status(400).json({ message: 'Invalid cache type' });
      }

      res.json(cachedData);
    } catch (error) {
      console.error('Get cached data error:', error);
      res.status(500).json({ message: 'Server error getting cached data' });
    }
  }

  // Update cached data
  async updateCachedData(req, res) {
    try {
      const userId = req.user.userId;
      const { type, data } = req.body;

      // This would typically update a cache store like Redis
      // For now, we'll just return success
      res.json({ message: 'Cache updated successfully' });
    } catch (error) {
      console.error('Update cached data error:', error);
      res.status(500).json({ message: 'Server error updating cached data' });
    }
  }

  // Clear user cache
  async clearCache(req, res) {
    try {
      const userId = req.user.userId;
      const { type } = req.query;

      // This would typically clear cache entries from Redis
      // For now, we'll just return success
      res.json({ message: 'Cache cleared successfully' });
    } catch (error) {
      console.error('Clear cache error:', error);
      res.status(500).json({ message: 'Server error clearing cache' });
    }
  }
}

module.exports = new UserController();
