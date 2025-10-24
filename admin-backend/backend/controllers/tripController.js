const Trip = require('../../../models/TripModel');
const User = require('../../../models/User');
const Motorcycle = require('../../../models/motorcycleModel');

// Get all trips with filtering and pagination
const getTrips = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      userId,
      status,
      dateFrom,
      dateTo,
      search
    } = req.query;

    // Build filter object
    const filter = { isArchived: false };

    if (userId) filter.user = userId;
    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.startTime = {};
      if (dateFrom) filter.startTime.$gte = new Date(dateFrom);
      if (dateTo) filter.startTime.$lte = new Date(dateTo);
    }
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'startLocation.address': new RegExp(search, 'i') },
        { 'endLocation.address': new RegExp(search, 'i') }
      ];
    }

    const trips = await Trip.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('motorcycle', 'make model plateNumber')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trip.countDocuments(filter);

    res.json({
      success: true,
      data: {
        trips,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trips',
      error: error.message
    });
  }
};

// Get single trip
const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('motorcycle', 'make model plateNumber year');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    res.json({
      success: true,
      data: { trip }
    });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trip',
      error: error.message
    });
  }
};

// Create new trip
const createTrip = async (req, res) => {
  try {
    const tripData = {
      ...req.body,
      user: req.user.id
    };

    const trip = new Trip(tripData);
    await trip.save();

    // Update user statistics
    const user = await User.findById(req.user.id);
    if (user) {
      user.stats.totalTrips += 1;
      user.stats.totalDistance += trip.distance || 0;
      await user.save();
    }

    // Update motorcycle statistics
    if (trip.motorcycle) {
      const motorcycle = await Motorcycle.findById(trip.motorcycle);
      if (motorcycle) {
        motorcycle.stats.totalTrips += 1;
        motorcycle.stats.totalDistance += trip.distance || 0;
        motorcycle.stats.lastTripDate = trip.startTime;
        await motorcycle.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: { trip }
    });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create trip',
      error: error.message
    });
  }
};

// Update trip
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user can update (only trip owner or admin)
    if (trip.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this trip'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        trip[key] = req.body[key];
      }
    });

    await trip.save();

    res.json({
      success: true,
      message: 'Trip updated successfully',
      data: { trip }
    });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update trip',
      error: error.message
    });
  }
};

// Delete trip
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user can delete (only trip owner or admin)
    if (trip.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this trip'
      });
    }

    await Trip.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete trip',
      error: error.message
    });
  }
};

// Get user trips
const getUserTrips = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, dateFrom, dateTo } = req.query;

    const options = {};
    if (status) options.status = status;
    if (dateFrom && dateTo) {
      options.dateFrom = dateFrom;
      options.dateTo = dateTo;
    }

    const trips = await Trip.findByUser(userId, options)
      .populate('motorcycle', 'make model plateNumber')
      .sort({ startTime: -1 });

    res.json({
      success: true,
      data: { trips }
    });
  } catch (error) {
    console.error('Get user trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user trips',
      error: error.message
    });
  }
};

// Get trips by date range
const getTripsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const trips = await Trip.getTripsByDateRange(startDate, endDate, userId)
      .populate('user', 'firstName lastName email')
      .populate('motorcycle', 'make model plateNumber');

    res.json({
      success: true,
      data: { trips }
    });
  } catch (error) {
    console.error('Get trips by date range error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trips by date range',
      error: error.message
    });
  }
};

// Get paginated trips
const getPaginatedTrips = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const trips = await Trip.find({ isArchived: false })
      .populate('user', 'firstName lastName email')
      .populate('motorcycle', 'make model plateNumber')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trip.countDocuments({ isArchived: false });

    res.json({
      success: true,
      data: {
        trips,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get paginated trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get paginated trips',
      error: error.message
    });
  }
};

// Get trip analytics
const getTripAnalytics = async (req, res) => {
  try {
    const { userId } = req.query;
    const stats = await Trip.getTripStats(userId);

    res.json({
      success: true,
      data: {
        analytics: stats[0] || {
          totalTrips: 0,
          totalDistance: 0,
          totalDuration: 0,
          totalFuelConsumption: 0,
          totalFuelCost: 0,
          avgDistance: 0,
          avgDuration: 0,
          avgSpeed: 0,
          avgFuelEfficiency: 0
        }
      }
    });
  } catch (error) {
    console.error('Get trip analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trip analytics',
      error: error.message
    });
  }
};

// Get monthly trip summary
const getMonthlyTripSummary = async (req, res) => {
  try {
    const { year, month, userId } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Year and month are required'
      });
    }

    const trips = await Trip.getMonthlyTripSummary(parseInt(year), parseInt(month), userId);

    res.json({
      success: true,
      data: { trips }
    });
  } catch (error) {
    console.error('Get monthly trip summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get monthly trip summary',
      error: error.message
    });
  }
};

// Get top users by trip count
const getTopUsersByTripCount = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const topUsers = await Trip.aggregate([
      { $match: { isArchived: false } },
      {
        $group: {
          _id: '$user',
          tripCount: { $sum: 1 },
          totalDistance: { $sum: '$distance' }
        }
      },
      { $sort: { tripCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          user: {
            firstName: 1,
            lastName: 1,
            email: 1
          },
          tripCount: 1,
          totalDistance: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: { topUsers }
    });
  } catch (error) {
    console.error('Get top users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top users',
      error: error.message
    });
  }
};

// Get most used motorcycles
const getMostUsedMotors = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const mostUsedMotors = await Trip.aggregate([
      { $match: { isArchived: false } },
      {
        $group: {
          _id: '$motorcycle',
          tripCount: { $sum: 1 },
          totalDistance: { $sum: '$distance' }
        }
      },
      { $sort: { tripCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'motorcycles',
          localField: '_id',
          foreignField: '_id',
          as: 'motorcycle'
        }
      },
      { $unwind: '$motorcycle' },
      {
        $project: {
          motorcycle: {
            make: 1,
            model: 1,
            plateNumber: 1,
            year: 1
          },
          tripCount: 1,
          totalDistance: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: { mostUsedMotors }
    });
  } catch (error) {
    console.error('Get most used motors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get most used motorcycles',
      error: error.message
    });
  }
};

// Add route point to trip
const addRoutePoint = async (req, res) => {
  try {
    const { coordinates, speed, altitude } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user can update (only trip owner)
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this trip'
      });
    }

    await trip.addRoutePoint(coordinates, speed, altitude);

    res.json({
      success: true,
      message: 'Route point added successfully',
      data: { trip }
    });
  } catch (error) {
    console.error('Add route point error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add route point',
      error: error.message
    });
  }
};

// Add expense to trip
const addExpense = async (req, res) => {
  try {
    const { type, amount, description, location } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user can update (only trip owner)
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this trip'
      });
    }

    await trip.addExpense(type, amount, description, location);

    res.json({
      success: true,
      message: 'Expense added successfully',
      data: { trip }
    });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add expense',
      error: error.message
    });
  }
};

module.exports = {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  getUserTrips,
  getTripsByDateRange,
  getPaginatedTrips,
  getTripAnalytics,
  getMonthlyTripSummary,
  getTopUsersByTripCount,
  getMostUsedMotors,
  addRoutePoint,
  addExpense
};
