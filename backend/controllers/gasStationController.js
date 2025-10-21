const GasStation = require('../models/GasStation');

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
        radius = 10
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

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const gasStations = await GasStation.find(filter)
        .sort(sortOptions)
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
      console.error('Get gas stations error:', error);
      res.status(500).json({ message: 'Server error getting gas stations' });
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
}

module.exports = new GasStationController();
