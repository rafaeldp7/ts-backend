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
  // IMPLEMENTATION: 
  // 1. VERIFY - Checks if gas station exists by ID
  // 2. IF NON-EXISTING - Automatically creates new station with provided data or defaults
  // 3. Updates price for the station (existing or newly created)
  async updateGasPrice(req, res) {
    try {
      // Trim and clean the ID to handle any whitespace issues
      const id = req.params.id ? req.params.id.trim() : null;
      const { fuelType, newPrice, name, location, address, brand, city, state, country } = req.body;
      // User ID is optional - can be from authenticated user or null for anonymous updates
      const userId = req.user?._id || req.user?.id || req.user?.userId || null;

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

      // Validate MongoDB ObjectId format using mongoose's built-in validation
      const mongoose = require('mongoose');
      if (id && !mongoose.Types.ObjectId.isValid(id)) {
        console.error(`[updateGasPrice] Invalid ObjectId format: ${id}`);
        return res.status(400).json({ 
          success: false,
          message: 'Invalid gas station ID format. Must be a valid MongoDB ObjectId' 
        });
      }

      // STEP 1: VERIFY - Find gas station
      let station = await GasStation.findById(id);
      let isNewStation = false;
      
      // STEP 2: IF NON-EXISTING, CREATE NEW
      if (!station) {
        console.log(`[updateGasPrice] Station not found with ID: ${id}. Attempting to create new station...`);
        isNewStation = true;

        // Try to get coordinates from different sources
        let coordinates = null;
        let stationName = name || `Gas Station ${id.substring(0, 8)}`; // Use provided name or generate from ID

        // Check if location is provided in request body
        if (location && location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
          coordinates = location.coordinates;
        }
        // Check if coordinates are provided directly in request body (alternative format)
        else if (req.body.coordinates && Array.isArray(req.body.coordinates) && req.body.coordinates.length === 2) {
          coordinates = req.body.coordinates;
        }
        // Check if lat/lng are provided separately
        else if (req.body.lat !== undefined && req.body.lng !== undefined) {
          coordinates = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
        }
        // Check if latitude/longitude are provided (alternative naming)
        else if (req.body.latitude !== undefined && req.body.longitude !== undefined) {
          coordinates = [parseFloat(req.body.longitude), parseFloat(req.body.latitude)];
        }

        // If still no coordinates, try to get from PriceHistory (if stationId exists there)
        if (!coordinates) {
          try {
            const PriceHistory = require('../models/PriceHistoryModel');
            const priceHistory = await PriceHistory.findOne({ stationId: id }).sort({ date: -1 });
            
            // Note: PriceHistory doesn't store location, so we can't get it from there
            // But we log that we tried
            if (priceHistory) {
              console.log(`[updateGasPrice] Found price history for station ${id}, but location not available`);
            }
          } catch (err) {
            console.log(`[updateGasPrice] Could not check PriceHistory: ${err.message}`);
          }
        }

        // If coordinates are still missing, we cannot create the station
        if (!coordinates || coordinates.length !== 2) {
          return res.status(400).json({ 
            success: false,
            message: `Gas station with ID "${id}" not found. To create a new station, please provide location coordinates in one of these formats:
- location.coordinates: [lng, lat]
- coordinates: [lng, lat]  
- lat and lng: { lat: number, lng: number }
- latitude and longitude: { latitude: number, longitude: number }` 
          });
        }

        // Validate coordinates
        const [lng, lat] = coordinates;
        if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat) ||
            lng < -180 || lng > 180 || lat < -90 || lat > 90) {
          return res.status(400).json({ 
            success: false,
            message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90' 
          });
        }

        // Create new gas station with provided or default data
        const stationData = {
          _id: id, // Use the provided ID
          name: stationName.trim(),
          location: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          brand: brand || 'Unknown',
          country: country || 'Philippines',
          isActive: true,
          isVerified: false
        };

        // Add optional fields if provided
        if (address) stationData.address = typeof address === 'string' ? address.trim() : address;
        if (city) stationData.city = typeof city === 'string' ? city.trim() : city;
        if (state) stationData.state = typeof state === 'string' ? state.trim() : state;

        // Initialize empty prices array - will be set by updatePrice method
        stationData.prices = [];

        // Initialize fuelTypes array
        stationData.fuelTypes = [fuelType];

        // Create the station
        try {
          station = new GasStation(stationData);
          await station.save();
          console.log(`✅ Created new gas station: ${station.name} (${id}) at [${lng}, ${lat}]`);
        } catch (createError) {
          // If creation fails (e.g., duplicate key), try to find it again
          if (createError.code === 11000 || createError.message.includes('duplicate')) {
            console.log(`[updateGasPrice] Station creation failed (possibly duplicate), attempting to find existing station...`);
            station = await GasStation.findById(id);
            if (station) {
              console.log(`[updateGasPrice] Found existing station after creation attempt`);
              isNewStation = false;
            } else {
              throw createError;
            }
          } else {
            throw createError;
          }
        }
        
        // Note: Price will be set below using updatePrice method, which will track it in history
      } else {
        console.log(`[updateGasPrice] Station found: ${station.name} (${id})`);
      }

      // Get old price before update
      const existingPrice = station.prices.find(p => p.fuelType === fuelType);
      const oldPrice = existingPrice ? existingPrice.price : null;

      // Update price using the model method (userId can be null for anonymous updates)
      await station.updatePrice(fuelType, newPrice, userId);

      // Refresh station data after update
      station = await GasStation.findById(station._id);

      // Populate updatedBy in the latest price history entry (only if userId exists)
      const latestHistory = station.priceHistory[station.priceHistory.length - 1];
      if (latestHistory && latestHistory.updatedBy) {
        await station.populate({
          path: 'priceHistory.updatedBy',
          select: 'name email'
        });
      }

      res.status(200).json({
        success: true,
        message: isNewStation 
          ? 'Gas station created and price set successfully' 
          : 'Price updated successfully',
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
            changed: oldPrice !== newPrice,
            isNewStation: isNewStation
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
