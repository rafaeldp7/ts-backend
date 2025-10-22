const User = require('../models/User');
const Report = require('../models/Report');
const GasStation = require('../models/GasStation');
const Motor = require('../models/Motor');
const Trip = require('../models/Trip');

class SearchController {
  // Search users
  async searchUsers(req, res) {
    try {
      const { q, page = 1, limit = 20 } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const filter = {
        $or: [
          { firstName: { $regex: q, $options: 'i' } },
          { lastName: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } }
        ]
      };

      const users = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
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
      console.error('Error searching users:', error);
      res.status(500).json({ 
        error: 'Failed to search users',
        message: error.message 
      });
    }
  }

  // Search reports
  async searchReports(req, res) {
    try {
      const { q, page = 1, limit = 20, type, status } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const filter = {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { 'location.barangay': { $regex: q, $options: 'i' } },
          { 'location.city': { $regex: q, $options: 'i' } }
        ]
      };

      if (type) filter.type = type;
      if (status) filter.status = status;

      const reports = await Report.find(filter)
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Report.countDocuments(filter);

      res.json({
        reports,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Error searching reports:', error);
      res.status(500).json({ 
        error: 'Failed to search reports',
        message: error.message 
      });
    }
  }

  // Search gas stations
  async searchGasStations(req, res) {
    try {
      const { q, page = 1, limit = 20, brand } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const filter = {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { 'location.barangay': { $regex: q, $options: 'i' } },
          { 'location.city': { $regex: q, $options: 'i' } }
        ]
      };

      if (brand) filter.brand = brand;

      const gasStations = await GasStation.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await GasStation.countDocuments(filter);

      res.json({
        gasStations,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Error searching gas stations:', error);
      res.status(500).json({ 
        error: 'Failed to search gas stations',
        message: error.message 
      });
    }
  }

  // Search motorcycles
  async searchMotorcycles(req, res) {
    try {
      const { q, page = 1, limit = 20 } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const filter = {
        $or: [
          { model: { $regex: q, $options: 'i' } },
          { brand: { $regex: q, $options: 'i' } },
          { engineDisplacement: { $regex: q, $options: 'i' } }
        ]
      };

      const motorcycles = await Motor.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Motor.countDocuments(filter);

      res.json({
        motorcycles,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Error searching motorcycles:', error);
      res.status(500).json({ 
        error: 'Failed to search motorcycles',
        message: error.message 
      });
    }
  }

  // Search trips
  async searchTrips(req, res) {
    try {
      const { q, page = 1, limit = 20, userId } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const filter = {
        $or: [
          { 'startLocation.barangay': { $regex: q, $options: 'i' } },
          { 'endLocation.barangay': { $regex: q, $options: 'i' } },
          { 'startLocation.city': { $regex: q, $options: 'i' } },
          { 'endLocation.city': { $regex: q, $options: 'i' } }
        ]
      };

      if (userId) filter.userId = userId;

      const trips = await Trip.find(filter)
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Trip.countDocuments(filter);

      res.json({
        trips,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Error searching trips:', error);
      res.status(500).json({ 
        error: 'Failed to search trips',
        message: error.message 
      });
    }
  }
}

module.exports = new SearchController();
