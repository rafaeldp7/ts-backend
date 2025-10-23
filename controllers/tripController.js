const Trip = require('../models/TripModel');
const Motor = require('../models/Motor');

class TripController {
  // Get all trips for user
  async getTrips(req, res) {
    try {
      const userId = req.user?.userId;
      const { 
        page = 1, 
        limit = 10, 
        status,
        motorId,
        sortBy = 'tripStartTime',
        sortOrder = 'desc',
        startDate,
        endDate
      } = req.query;

      // Build filter object
      const filter = {};
      if (userId) filter.userId = userId;
      if (status) filter.status = status;
      if (motorId) filter.motorId = motorId;
      
      // Add date range filter
      if (startDate || endDate) {
        filter.tripStartTime = {};
        if (startDate) filter.tripStartTime.$gte = new Date(startDate);
        if (endDate) filter.tripStartTime.$lte = new Date(endDate);
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const trips = await Trip.find(filter)
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('motorId', 'nickname brand model');

      const total = await Trip.countDocuments(filter);

      res.json({
        trips,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Get trips error:', error);
      res.status(500).json({ message: 'Server error getting trips' });
    }
  }

  // Get single trip
  async getTrip(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const trip = await Trip.findOne({ _id: id, userId })
        .populate('motorId', 'nickname brand model');

      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }

      res.json(trip);
    } catch (error) {
      console.error('Get trip error:', error);
      res.status(500).json({ message: 'Server error getting trip' });
    }
  }

  // Create new trip
  async createTrip(req, res) {
    try {
      const userId = req.user?.userId;
      const tripData = {
        ...req.body,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const trip = new Trip(tripData);
      await trip.save();

      // Populate motor data
      await trip.populate('motorId', 'nickname brand model');

      res.status(201).json(trip);
    } catch (error) {
      console.error('Create trip error:', error);
      res.status(500).json({ message: 'Server error creating trip' });
    }
  }

  // Update trip
  async updateTrip(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const updates = { ...req.body, updatedAt: new Date() };

      const trip = await Trip.findOneAndUpdate(
        { _id: id, userId },
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('motorId', 'nickname brand model');

      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }

      res.json(trip);
    } catch (error) {
      console.error('Update trip error:', error);
      res.status(500).json({ message: 'Server error updating trip' });
    }
  }

  // Delete trip
  async deleteTrip(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const trip = await Trip.findOneAndDelete({ _id: id, userId });
      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }

      res.json({ message: 'Trip deleted successfully' });
    } catch (error) {
      console.error('Delete trip error:', error);
      res.status(500).json({ message: 'Server error deleting trip' });
    }
  }

  // Get trip analytics
  async getTripAnalytics(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const trip = await Trip.findOne({ _id: id, userId });
      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }

      // Calculate analytics
      const analytics = {
        distance: trip.actualDistance || 0,
        duration: trip.duration || 0,
        avgSpeed: trip.kmph || 0,
        fuelUsed: trip.actualFuelUsedMin || 0,
        fuelEfficiency: trip.actualDistance && trip.actualFuelUsedMin 
          ? trip.actualDistance / trip.actualFuelUsedMin 
          : 0,
        wasRerouted: trip.wasRerouted || false,
        rerouteCount: trip.rerouteCount || 0,
        wasInBackground: trip.wasInBackground || false,
        trafficCondition: trip.trafficCondition || 'unknown'
      };

      res.json(analytics);
    } catch (error) {
      console.error('Get trip analytics error:', error);
      res.status(500).json({ message: 'Server error getting trip analytics' });
    }
  }

  // Complete trip
  async completeTrip(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const { tripEndTime, finalStats } = req.body;

      const trip = await Trip.findOneAndUpdate(
        { _id: id, userId },
        { 
          $set: { 
            status: 'completed',
            tripEndTime: tripEndTime || new Date(),
            ...finalStats,
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      ).populate('motorId', 'nickname brand model');

      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }

      res.json(trip);
    } catch (error) {
      console.error('Complete trip error:', error);
      res.status(500).json({ message: 'Server error completing trip' });
    }
  }

  // Cancel trip
  async cancelTrip(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const trip = await Trip.findOneAndUpdate(
        { _id: id, userId },
        { 
          $set: { 
            status: 'cancelled',
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      ).populate('motorId', 'nickname brand model');

      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }

      res.json(trip);
    } catch (error) {
      console.error('Cancel trip error:', error);
      res.status(500).json({ message: 'Server error cancelling trip' });
    }
  }

  // Get trip route
  async getTripRoute(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const trip = await Trip.findOne({ _id: id, userId }).select('plannedPolyline actualPolyline');
      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }

      res.json({
        plannedRoute: trip.plannedPolyline,
        actualRoute: trip.actualPolyline
      });
    } catch (error) {
      console.error('Get trip route error:', error);
      res.status(500).json({ message: 'Server error getting trip route' });
    }
  }

  // Update trip route
  async updateTripRoute(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const { plannedPolyline, actualPolyline } = req.body;

      const trip = await Trip.findOneAndUpdate(
        { _id: id, userId },
        { 
          $set: { 
            plannedPolyline,
            actualPolyline,
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      );

      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }

      res.json({
        plannedRoute: trip.plannedPolyline,
        actualRoute: trip.actualPolyline
      });
    } catch (error) {
      console.error('Update trip route error:', error);
      res.status(500).json({ message: 'Server error updating trip route' });
    }
  }
}

module.exports = new TripController();
