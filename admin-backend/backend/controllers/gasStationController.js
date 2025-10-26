const GasStation = require('../../../models/GasStation');
const Notification = require('../../../models/Notification');
const { logAdminAction } = require('./adminLogsController');
const { sendErrorResponse, sendSuccessResponse } = require('../middleware/validation');

// Get all gas stations with filtering and pagination
const getGasStations = async (req, res) => {
  try {
    const stations = await GasStation.find().sort({ updatedAt: -1 });
    res.json(stations);
  } catch (err) {
    res.status(500).json({ msg: "Fetch failed", error: err.message });
  }
}

// Get single gas station
const getGasStation = async (req, res) => {
  try {
    const station = await GasStation.findById(req.params.id)
      .populate('verifiedBy', 'firstName lastName')
      .populate('archivedBy', 'firstName lastName')
      .populate('reviews.user', 'firstName lastName');

    if (!station) {
      return sendErrorResponse(res, 404, 'Gas station not found');
    }

    sendSuccessResponse(res, { station });
  } catch (error) {
    console.error('Get gas station error:', error);
    sendErrorResponse(res, 500, 'Failed to get gas station', error);
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
    sendErrorResponse(res, 500, 'Failed to create gas station', error);
  }
};

// Update gas station
const updateGasStation = async (req, res) => {
  try {
    const station = await GasStation.findById(req.params.id);

    if (!station) {
      return sendErrorResponse(res, 404, 'Gas station not found');
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

    sendSuccessResponse(res, { station }, 'Gas station updated successfully');
  } catch (error) {
    console.error('Update gas station error:', error);
    sendErrorResponse(res, 500, 'Failed to update gas station', error);
  }
};

// Delete gas station
const deleteGasStation = async (req, res) => {
  try {
    const station = await GasStation.findById(req.params.id);

    if (!station) {
      return sendErrorResponse(res, 404, 'Gas station not found');
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

    sendSuccessResponse(res, null, 'Gas station deleted successfully');
  } catch (error) {
    console.error('Delete gas station error:', error);
    sendErrorResponse(res, 500, 'Failed to delete gas station', error);
  }
};

// Update fuel prices
const updateFuelPrices = async (req, res) => {
  try {
    const { prices } = req.body;
    const station = await GasStation.findById(req.params.id);

    if (!station) {
      return sendErrorResponse(res, 404, 'Gas station not found');
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

    sendSuccessResponse(res, { station }, 'Fuel prices updated successfully');
  } catch (error) {
    console.error('Update fuel prices error:', error);
    sendErrorResponse(res, 500, 'Failed to update fuel prices', error);
  }
};

// Add review to gas station
const addReview = async (req, res) => {
  try {
    const { rating, comment, categories } = req.body;
    const station = await GasStation.findById(req.params.id);

    if (!station) {
      return sendErrorResponse(res, 404, 'Gas station not found');
    }

    const reviewData = {
      rating,
      comment,
      categories
    };

    await station.addReview(req.user.id, rating, comment, categories);

    // Log the review addition action (if admin is adding review)
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'UPDATE',
        'GAS_STATION',
        {
          description: `Added review to gas station: ${station.name} (${station.brand})`,
          stationId: station._id,
          stationName: station.name,
          stationBrand: station.brand,
          reviewDetails: {
            rating: rating,
            comment: comment,
            categories: categories
          }
        },
        req
      );
    }

    sendSuccessResponse(res, { station }, 'Review added successfully');
  } catch (error) {
    console.error('Add review error:', error);
    sendErrorResponse(res, 500, 'Failed to add review', error);
  }
};

// Verify gas station (admin only)
const verifyGasStation = async (req, res) => {
  try {
    const station = await GasStation.findById(req.params.id);

    if (!station) {
      return sendErrorResponse(res, 404, 'Gas station not found');
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

    sendSuccessResponse(res, { station }, 'Gas station verified successfully');
  } catch (error) {
    console.error('Verify gas station error:', error);
    sendErrorResponse(res, 500, 'Failed to verify gas station', error);
  }
};

// Get gas stations by brand
const getGasStationsByBrand = async (req, res) => {
  try {
    const { brand } = req.params;
    const stations = await GasStation.findByBrand(brand);

    sendSuccessResponse(res, { stations });
  } catch (error) {
    console.error('Get gas stations by brand error:', error);
    sendErrorResponse(res, 500, 'Failed to get gas stations by brand', error);
  }
};

// Get gas stations by city
const getGasStationsByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const stations = await GasStation.findByCity(city);

    sendSuccessResponse(res, { stations });
  } catch (error) {
    console.error('Get gas stations by city error:', error);
    sendErrorResponse(res, 500, 'Failed to get gas stations by city', error);
  }
};

// Get gas station statistics
const getGasStationStats = async (req, res) => {
  try {
    const stats = await GasStation.getStationStats();

    sendSuccessResponse(res, {
      stats: stats[0] || {
        totalStations: 0,
        activeStations: 0,
        verifiedStations: 0,
        avgRating: 0,
        totalReviews: 0
      }
    });
  } catch (error) {
    console.error('Get gas station stats error:', error);
    sendErrorResponse(res, 500, 'Failed to get gas station statistics', error);
  }
};

// Get nearby gas stations
const getNearbyGasStations = async (req, res) => {
  try {
    const { lat, lng, radius = 5000, limit = 20 } = req.query;

    if (!lat || !lng) {
      return sendErrorResponse(res, 400, 'Latitude and longitude are required');
    }

    const stations = await GasStation.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(radius),
      parseInt(limit)
    );

    sendSuccessResponse(res, { stations });
  } catch (error) {
    console.error('Get nearby gas stations error:', error);
    sendErrorResponse(res, 500, 'Failed to get nearby gas stations', error);
  }
};

// Archive gas station
const archiveGasStation = async (req, res) => {
  try {
    const station = await GasStation.findById(req.params.id);

    if (!station) {
      return sendErrorResponse(res, 404, 'Gas station not found');
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

    sendSuccessResponse(res, null, 'Gas station archived successfully');
  } catch (error) {
    console.error('Archive gas station error:', error);
    sendErrorResponse(res, 500, 'Failed to archive gas station', error);
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

    sendSuccessResponse(res, { trends });
  } catch (error) {
    console.error('Get fuel price trends error:', error);
    sendErrorResponse(res, 500, 'Failed to get fuel price trends', error);
  }
};

// Reverse geocoding endpoint - Get address from coordinates
const reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return sendErrorResponse(res, 400, 'Latitude and longitude are required');
    }
    
    // Create a temporary gas station instance to use the method
    const tempStation = new GasStation({
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      }
    });
    
    const addressInfo = await tempStation.getAddressFromCoordinates();
    
    if (addressInfo.success) {
      sendSuccessResponse(res, {
        coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
        address: addressInfo.address,
        formattedAddress: addressInfo.formattedAddress,
        placeId: addressInfo.placeId,
        types: addressInfo.types
      }, 'Address retrieved successfully');
    } else {
      sendErrorResponse(res, 400, addressInfo.message || 'Reverse geocoding failed', {
        fallback: addressInfo.fallback
      });
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    sendErrorResponse(res, 500, 'Failed to perform reverse geocoding', error);
  }
};

// Bulk reverse geocoding for multiple gas stations
const bulkReverseGeocodeStations = async (req, res) => {
  try {
    const { stationIds } = req.body;
    
    if (!stationIds || !Array.isArray(stationIds)) {
      return sendErrorResponse(res, 400, 'stationIds array is required');
    }
    
    const stations = await GasStation.find({ _id: { $in: stationIds } });
    const results = [];
    
    for (const station of stations) {
      try {
        const addressInfo = await station.getAddressFromCoordinates();
        
        if (addressInfo.success) {
          // Update station with geocoded address
          station.address = addressInfo.formattedAddress;
          station.city = addressInfo.address.city;
          station.state = addressInfo.address.state;
          station.country = addressInfo.address.country;
          await station.save();
          
          results.push({ 
            stationId: station._id, 
            success: true, 
            address: addressInfo.formattedAddress 
          });
        } else {
          results.push({ 
            stationId: station._id, 
            success: false, 
            error: addressInfo.message 
          });
        }
      } catch (error) {
        results.push({ 
          stationId: station._id, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    sendSuccessResponse(res, {
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    }, 'Bulk reverse geocoding completed');
  } catch (error) {
    console.error('Bulk reverse geocoding error:', error);
    sendErrorResponse(res, 500, 'Failed to perform bulk reverse geocoding', error);
  }
};

// Auto-reverse geocode a specific gas station
const autoReverseGeocodeStation = async (req, res) => {
  try {
    const station = await GasStation.findById(req.params.id);
    
    if (!station) {
      return sendErrorResponse(res, 404, 'Gas station not found');
    }
    
    if (!station.location || !station.location.coordinates || station.location.coordinates.length !== 2) {
      return sendErrorResponse(res, 400, 'Gas station does not have valid coordinates');
    }
    
    const addressInfo = await station.getAddressFromCoordinates();
    
    if (addressInfo.success) {
      // Update station with geocoded address
      station.address = addressInfo.formattedAddress;
      station.city = addressInfo.address.city;
      station.state = addressInfo.address.state;
      station.country = addressInfo.address.country;
      await station.save();
      
      // Log the reverse geocoding action
      if (req.user?.id) {
        await logAdminAction(
          req.user.id,
          'UPDATE',
          'GAS_STATION',
          {
            description: `Auto-reverse geocoded gas station: "${station.name}" (ID: ${station._id})`,
            stationId: station._id,
            stationName: station.name,
            geocodedAddress: addressInfo.formattedAddress,
            coordinates: {
              latitude: station.location.coordinates[1],
              longitude: station.location.coordinates[0]
            }
          },
          req
        );
      }
      
      sendSuccessResponse(res, {
        station: {
          _id: station._id,
          name: station.name,
          address: station.address,
          city: station.city,
          state: station.state,
          country: station.country
        }
      }, 'Gas station reverse geocoded successfully');
    } else {
      sendErrorResponse(res, 400, addressInfo.message || 'Reverse geocoding failed', {
        fallback: addressInfo.fallback
      });
    }
  } catch (error) {
    console.error('Auto reverse geocoding error:', error);
    sendErrorResponse(res, 500, 'Failed to auto reverse geocode gas station', error);
  }
};

// Auto-reverse geocode ALL existing gas stations without addresses
const autoReverseGeocodeAllStations = async (req, res) => {
  try {
    // Find all stations with coordinates but no address (or empty address)
    const stations = await GasStation.find({
      location: { $exists: true, $ne: null },
      $or: [
        { address: { $exists: false } },
        { address: '' },
        { address: null }
      ]
    });
    
    const results = [];
    
    for (const station of stations) {
      try {
        const addressInfo = await station.getAddressFromCoordinates();
        
        if (addressInfo.success) {
          // Update station with geocoded address
          station.address = addressInfo.formattedAddress;
          station.city = addressInfo.address.city;
          station.state = addressInfo.address.state;
          station.country = addressInfo.address.country;
          await station.save();
          
          results.push({
            stationId: station._id,
            name: station.name,
            success: true,
            address: addressInfo.formattedAddress
          });
        } else {
          results.push({
            stationId: station._id,
            name: station.name,
            success: false,
            error: addressInfo.message
          });
        }
      } catch (error) {
        results.push({
          stationId: station._id,
          name: station.name,
          success: false,
          error: error.message
        });
      }
    }
    
    // Log the bulk reverse geocoding action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'UPDATE',
        'GAS_STATION',
        {
          description: `Bulk auto-reverse geocoded ${results.length} gas stations`,
          totalStations: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        },
        req
      );
    }
    
    sendSuccessResponse(res, {
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    }, 'Bulk reverse geocoding completed');
  } catch (error) {
    console.error('Auto reverse geocode all error:', error);
    sendErrorResponse(res, 500, 'Failed to auto reverse geocode all stations', error);
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
  getFuelPriceTrends,
  reverseGeocode,
  bulkReverseGeocodeStations,
  autoReverseGeocodeStation,
  autoReverseGeocodeAllStations
};
