const GasStation = require('../../../models/GasStation');
const Notification = require('../../../models/Notification');
const { logAdminAction } = require('./adminLogsController');

// Get all gas stations with filtering and pagination
const getGasStations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      brand,
      city,
      barangay,
      lat,
      lng,
      radius,
      search,
      services
    } = req.query;

    // Build filter object
    const filter = { isArchived: false, status: 'active' };

    if (brand) filter.brand = new RegExp(brand, 'i');
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (barangay) filter['location.barangay'] = new RegExp(barangay, 'i');
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { 'location.address': new RegExp(search, 'i') }
      ];
    }
    if (services) {
      const serviceArray = services.split(',');
      serviceArray.forEach(service => {
        filter[`services.${service}`] = true;
      });
    }

    let stations;

    // If location is provided, use geospatial query
    if (lat && lng) {
      const radiusInMeters = radius ? parseInt(radius) : 5000;
      stations = await GasStation.findNearby(parseFloat(lat), parseFloat(lng), radiusInMeters, parseInt(limit));
    } else {
      stations = await GasStation.find(filter)
        .sort({ 'stats.averageRating': -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    }

    const total = await GasStation.countDocuments(filter);

    res.json({
      success: true,
      data: {
        stations,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get gas stations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get gas stations',
      error: error.message
    });
  }
};

// Get single gas station
const getGasStation = async (req, res) => {
  try {
    const station = await GasStation.findById(req.params.id)
      .populate('verifiedBy', 'firstName lastName')
      .populate('archivedBy', 'firstName lastName')
      .populate('reviews.user', 'firstName lastName');

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Gas station not found'
      });
    }

    res.json({
      success: true,
      data: { station }
    });
  } catch (error) {
    console.error('Get gas station error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get gas station',
      error: error.message
    });
  }
};

// Create new gas station
const createGasStation = async (req, res) => {
  try {
    const station = new GasStation(req.body);
    await station.save();

    // Log the gas station creation action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'CREATE',
        'GAS_STATION',
        {
          description: `Created new gas station: ${station.name} (${station.brand})`,
          stationId: station._id,
          stationName: station.name,
          stationBrand: station.brand,
          stationLocation: station.location?.address,
          stationCity: station.location?.city
        },
        req
      );
    }

    res.status(201).json({
      success: true,
      message: 'Gas station created successfully',
      data: { station }
    });
  } catch (error) {
    console.error('Create gas station error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create gas station',
      error: error.message
    });
  }
};

// Update gas station
const updateGasStation = async (req, res) => {
  try {
    const station = await GasStation.findById(req.params.id);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Gas station not found'
      });
    }

    // Store original data for logging
    const originalData = {
      name: station.name,
      brand: station.brand,
      status: station.status,
      location: station.location
    };

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        station[key] = req.body[key];
      }
    });

    await station.save();

    // Log the gas station update action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'UPDATE',
        'GAS_STATION',
        {
          description: `Updated gas station: ${station.name} (${station.brand})`,
          stationId: station._id,
          stationName: station.name,
          stationBrand: station.brand,
          changes: {
            before: originalData,
            after: {
              name: station.name,
              brand: station.brand,
              status: station.status,
              location: station.location
            }
          }
        },
        req
      );
    }

    res.json({
      success: true,
      message: 'Gas station updated successfully',
      data: { station }
    });
  } catch (error) {
    console.error('Update gas station error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gas station',
      error: error.message
    });
  }
};

// Delete gas station
const deleteGasStation = async (req, res) => {
  try {
    const station = await GasStation.findById(req.params.id);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Gas station not found'
      });
    }

    // Store station data for logging before deletion
    const deletedStationData = {
      id: station._id,
      name: station.name,
      brand: station.brand,
      location: station.location
    };

    await GasStation.findByIdAndDelete(req.params.id);

    // Log the gas station deletion action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'DELETE',
        'GAS_STATION',
        {
          description: `Deleted gas station: ${deletedStationData.name} (${deletedStationData.brand})`,
          stationId: deletedStationData.id,
          stationName: deletedStationData.name,
          stationBrand: deletedStationData.brand,
          stationLocation: deletedStationData.location?.address,
          stationCity: deletedStationData.location?.city
        },
        req
      );
    }

    res.json({
      success: true,
      message: 'Gas station deleted successfully'
    });
  } catch (error) {
    console.error('Delete gas station error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gas station',
      error: error.message
    });
  }
};

// Update fuel prices
const updateFuelPrices = async (req, res) => {
  try {
    const { prices } = req.body;
    const station = await GasStation.findById(req.params.id);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Gas station not found'
      });
    }

    // Store original prices for logging
    const originalPrices = {
      gasoline: station.fuelPrices?.gasoline,
      diesel: station.fuelPrices?.diesel,
      premium: station.fuelPrices?.premium
    };

    await station.updateFuelPrices(prices);

    // Log the fuel price update action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'UPDATE',
        'GAS_STATION',
        {
          description: `Updated fuel prices for gas station: ${station.name} (${station.brand})`,
          stationId: station._id,
          stationName: station.name,
          stationBrand: station.brand,
          changes: {
            before: originalPrices,
            after: prices
          }
        },
        req
      );
    }

    res.json({
      success: true,
      message: 'Fuel prices updated successfully',
      data: { station }
    });
  } catch (error) {
    console.error('Update fuel prices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update fuel prices',
      error: error.message
    });
  }
};

// Add review to gas station
const addReview = async (req, res) => {
  try {
    const { rating, comment, categories } = req.body;
    const station = await GasStation.findById(req.params.id);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Gas station not found'
      });
    }

    await station.addReview(req.user.id, rating, comment, categories);

    res.json({
      success: true,
      message: 'Review added successfully',
      data: { station }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: error.message
    });
  }
};

// Verify gas station (admin only)
const verifyGasStation = async (req, res) => {
  try {
    const station = await GasStation.findById(req.params.id);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Gas station not found'
      });
    }

    await station.updateStatus('active', req.user.id);

    // Log the gas station verification action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'UPDATE',
        'GAS_STATION',
        {
          description: `Verified gas station: ${station.name} (${station.brand})`,
          stationId: station._id,
          stationName: station.name,
          stationBrand: station.brand,
          previousStatus: 'pending',
          newStatus: 'active'
        },
        req
      );
    }

    res.json({
      success: true,
      message: 'Gas station verified successfully',
      data: { station }
    });
  } catch (error) {
    console.error('Verify gas station error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify gas station',
      error: error.message
    });
  }
};

// Get gas stations by brand
const getGasStationsByBrand = async (req, res) => {
  try {
    const { brand } = req.params;
    const stations = await GasStation.findByBrand(brand);

    res.json({
      success: true,
      data: { stations }
    });
  } catch (error) {
    console.error('Get gas stations by brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get gas stations by brand',
      error: error.message
    });
  }
};

// Get gas stations by city
const getGasStationsByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const stations = await GasStation.findByCity(city);

    res.json({
      success: true,
      data: { stations }
    });
  } catch (error) {
    console.error('Get gas stations by city error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get gas stations by city',
      error: error.message
    });
  }
};

// Get gas station statistics
const getGasStationStats = async (req, res) => {
  try {
    const stats = await GasStation.getStationStats();

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          totalStations: 0,
          activeStations: 0,
          verifiedStations: 0,
          avgRating: 0,
          totalReviews: 0
        }
      }
    });
  } catch (error) {
    console.error('Get gas station stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get gas station statistics',
      error: error.message
    });
  }
};

// Get nearby gas stations
const getNearbyGasStations = async (req, res) => {
  try {
    const { lat, lng, radius = 5000, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const stations = await GasStation.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radius),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: { stations }
    });
  } catch (error) {
    console.error('Get nearby gas stations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get nearby gas stations',
      error: error.message
    });
  }
};

// Archive gas station
const archiveGasStation = async (req, res) => {
  try {
    const station = await GasStation.findById(req.params.id);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Gas station not found'
      });
    }

    station.isArchived = true;
    station.archivedAt = new Date();
    station.archivedBy = req.user.id;
    await station.save();

    // Log the gas station archiving action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'UPDATE',
        'GAS_STATION',
        {
          description: `Archived gas station: ${station.name} (${station.brand})`,
          stationId: station._id,
          stationName: station.name,
          stationBrand: station.brand,
          previousStatus: station.status,
          newStatus: 'archived'
        },
        req
      );
    }

    res.json({
      success: true,
      message: 'Gas station archived successfully'
    });
  } catch (error) {
    console.error('Archive gas station error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive gas station',
      error: error.message
    });
  }
};

// Get fuel price trends
const getFuelPriceTrends = async (req, res) => {
  try {
    const { stationId, fuelType, days = 30 } = req.query;

    // This would typically involve a separate FuelPrice model
    // For now, we'll return a mock response
    const trends = {
      stationId,
      fuelType,
      days: parseInt(days),
      prices: [
        { date: '2024-01-01', price: 45.50 },
        { date: '2024-01-02', price: 45.75 },
        { date: '2024-01-03', price: 46.00 }
      ]
    };

    res.json({
      success: true,
      data: { trends }
    });
  } catch (error) {
    console.error('Get fuel price trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get fuel price trends',
      error: error.message
    });
  }
};

module.exports = {
  getGasStations,
  getGasStation,
  createGasStation,
  updateGasStation,
  deleteGasStation,
  updateFuelPrices,
  addReview,
  verifyGasStation,
  getGasStationsByBrand,
  getGasStationsByCity,
  getGasStationStats,
  getNearbyGasStations,
  archiveGasStation,
  getFuelPriceTrends
};
