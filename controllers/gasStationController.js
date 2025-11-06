const GasStation = require('../models/GasStation');
const { filterGasStations, validateCoordinates } = require('../utils/mapProcessingUtils');

class GasStationController {
  // Get all gas stations with filtering and pagination
  async getGasStations(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        name,
        brand,
        sortBy = 'name',
        sortOrder = 'asc',
        lat,
        lng,
        radius = 10,
        includeInvalid = false,
        viewport
      } = req.query;

      // Build filter object
      const filter = {};
      if (name) filter.name = { $regex: name, $options: 'i' };
      if (brand) filter.brand = { $regex: brand, $options: 'i' };

      // Add location filter if coordinates provided
      if (lat && lng) {
        filter.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        };
      }
      
      // Parse viewport if provided
      if (viewport) {
        try {
          const viewportBounds = typeof viewport === 'string' ? JSON.parse(viewport) : viewport;
          filter.location = {
            ...filter.location,
            $geoWithin: {
              $box: [
                [viewportBounds.west, viewportBounds.south],
                [viewportBounds.east, viewportBounds.north]
              ]
            }
          };
        } catch (e) {
          console.warn('Invalid viewport format:', e);
        }
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Fetch raw gas stations
      const rawGasStations = await GasStation.find(filter)
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      // Filter invalid gas stations unless explicitly included
      let gasStations = rawGasStations;
      if (includeInvalid !== 'true' && includeInvalid !== true) {
        gasStations = filterGasStations(rawGasStations);
      }

      const total = await GasStation.countDocuments(filter);

      res.json({
        success: true,
        data: gasStations,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
        statistics: {
          total: rawGasStations.length,
          filtered: gasStations.length,
          removed: rawGasStations.length - gasStations.length
        }
      });
    } catch (error) {
      console.error('Get gas stations error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error getting gas stations',
        error: error.message 
      });
    }
  }

  // Get nearby gas stations
  async getNearbyGasStations(req, res) {
    try {
      const { lat, lng, radius = 5, limit = 20 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      const gasStations = await GasStation.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        }
      })
      .limit(parseInt(limit));

      res.json(gasStations);
    } catch (error) {
      console.error('Get nearby gas stations error:', error);
      res.status(500).json({ message: 'Server error getting nearby gas stations' });
    }
  }

  // Get single gas station
  async getGasStation(req, res) {
    try {
      const { id } = req.params;

      const gasStation = await GasStation.findById(id);
      if (!gasStation) {
        return res.status(404).json({ message: 'Gas station not found' });
      }

      res.json(gasStation);
    } catch (error) {
      console.error('Get gas station error:', error);
      res.status(500).json({ message: 'Server error getting gas station' });
    }
  }

  // Create new gas station
  async createGasStation(req, res) {
    try {
      const gasStationData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const gasStation = new GasStation(gasStationData);
      await gasStation.save();

      res.status(201).json(gasStation);
    } catch (error) {
      console.error('Create gas station error:', error);
      res.status(500).json({ message: 'Server error creating gas station' });
    }
  }

  // Update gas station
  async updateGasStation(req, res) {
    try {
      const { id } = req.params;
      const updates = { ...req.body, updatedAt: new Date() };

      const gasStation = await GasStation.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!gasStation) {
        return res.status(404).json({ message: 'Gas station not found' });
      }

      res.json(gasStation);
    } catch (error) {
      console.error('Update gas station error:', error);
      res.status(500).json({ message: 'Server error updating gas station' });
    }
  }

  // Delete gas station
  async deleteGasStation(req, res) {
    try {
      const { id } = req.params;

      const gasStation = await GasStation.findByIdAndDelete(id);
      if (!gasStation) {
        return res.status(404).json({ message: 'Gas station not found' });
      }

      res.json({ message: 'Gas station deleted successfully' });
    } catch (error) {
      console.error('Delete gas station error:', error);
      res.status(500).json({ message: 'Server error deleting gas station' });
    }
  }

  // Get gas station prices
  async getGasStationPrices(req, res) {
    try {
      const { id } = req.params;

      const gasStation = await GasStation.findById(id).select('prices');
      if (!gasStation) {
        return res.status(404).json({ message: 'Gas station not found' });
      }

      res.json(gasStation.prices || []);
    } catch (error) {
      console.error('Get gas station prices error:', error);
      res.status(500).json({ message: 'Server error getting gas station prices' });
    }
  }

  // Update gas station prices
  async updateGasStationPrices(req, res) {
    try {
      const { id } = req.params;
      const { prices } = req.body;

      const gasStation = await GasStation.findByIdAndUpdate(
        id,
        { 
          $set: { 
            prices,
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      if (!gasStation) {
        return res.status(404).json({ message: 'Gas station not found' });
      }

      res.json(gasStation.prices);
    } catch (error) {
      console.error('Update gas station prices error:', error);
      res.status(500).json({ message: 'Server error updating gas station prices' });
    }
  }

  // Update gas price (single fuel type with history tracking)
  async updateGasPrice(req, res) {
    try {
      const { id } = req.params;
      const { fuelType, newPrice } = req.body;
      const userId = req.user?._id || req.user?.id;

      // Validate required fields
      if (!fuelType || newPrice === undefined || newPrice === null) {
        return res.status(400).json({ 
          success: false,
          message: 'fuelType and newPrice are required' 
        });
      }

      // Validate fuel type
      const validFuelTypes = ['gasoline', 'diesel', 'premium_gasoline', 'premium_diesel', 'lpg'];
      if (!validFuelTypes.includes(fuelType)) {
        return res.status(400).json({ 
          success: false,
          message: `Invalid fuelType. Must be one of: ${validFuelTypes.join(', ')}` 
        });
      }

      // Validate price
      if (typeof newPrice !== 'number' || newPrice < 0) {
        return res.status(400).json({ 
          success: false,
          message: 'newPrice must be a positive number' 
        });
      }

      // Check if user is authenticated
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          message: 'Authentication required. Please login.' 
        });
      }

      // Find gas station
      const station = await GasStation.findById(id);
      if (!station) {
        return res.status(404).json({ 
          success: false,
          message: 'Gas station not found' 
        });
      }

      // Get old price before update
      const existingPrice = station.prices.find(p => p.fuelType === fuelType);
      const oldPrice = existingPrice ? existingPrice.price : null;

      // Update price using the model method
      await station.updatePrice(fuelType, newPrice, userId);

      // Populate updatedBy in the latest price history entry
      const latestHistory = station.priceHistory[station.priceHistory.length - 1];
      if (latestHistory && latestHistory.updatedBy) {
        await station.populate({
          path: 'priceHistory.updatedBy',
          select: 'name email'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Price updated successfully',
        data: {
          station: {
            _id: station._id,
            name: station.name,
            prices: station.prices,
            priceHistory: station.priceHistory.slice(-10), // Return last 10 history entries
            lastUpdated: station.lastUpdated
          },
          update: {
            fuelType,
            oldPrice,
            newPrice,
            changed: oldPrice !== newPrice
          }
        }
      });
    } catch (error) {
      console.error('Update gas price error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error updating gas price', 
        error: error.message 
      });
    }
  }

  // Get price history for a gas station
  async getPriceHistory(req, res) {
    try {
      const { id } = req.params;
      const { fuelType, limit = 50 } = req.query;

      const station = await GasStation.findById(id)
        .select('name priceHistory')
        .populate({
          path: 'priceHistory.updatedBy',
          select: 'name email'
        });

      if (!station) {
        return res.status(404).json({ 
          success: false,
          message: 'Gas station not found' 
        });
      }

      let history = station.priceHistory;

      // Filter by fuel type if provided
      if (fuelType) {
        history = history.filter(h => h.fuelType === fuelType);
      }

      // Sort by date (newest first) and limit
      history = history
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, parseInt(limit));

      res.json({
        success: true,
        data: {
          stationId: station._id,
          stationName: station.name,
          history,
          count: history.length
        }
      });
    } catch (error) {
      console.error('Get price history error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error getting price history', 
        error: error.message 
      });
    }
  }
}

module.exports = new GasStationController();
