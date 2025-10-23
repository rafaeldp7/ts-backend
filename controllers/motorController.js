const Motor = require('../models/Motor');
const Trip = require('../models/TripModel');
const MaintenanceRecord = require('../models/maintenanceModel');

class MotorController {
  // Get all motors for user
  async getMotors(req, res) {
    try {
      const userId = req.user?.userId;
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const motors = await Motor.find({ userId })
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Motor.countDocuments({ userId });

      res.json({
        motors,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Get motors error:', error);
      res.status(500).json({ message: 'Server error getting motors' });
    }
  }

  // Get single motor
  async getMotor(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const motor = await Motor.findOne({ _id: id, userId });
      if (!motor) {
        return res.status(404).json({ message: 'Motor not found' });
      }

      res.json(motor);
    } catch (error) {
      console.error('Get motor error:', error);
      res.status(500).json({ message: 'Server error getting motor' });
    }
  }

  // Create new motor
  async createMotor(req, res) {
    try {
      const userId = req.user?.userId;
      const motorData = { ...req.body, userId };

      const motor = new Motor(motorData);
      await motor.save();

      res.status(201).json(motor);
    } catch (error) {
      console.error('Create motor error:', error);
      res.status(500).json({ message: 'Server error creating motor' });
    }
  }

  // Update motor
  async updateMotor(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const updates = req.body;

      const motor = await Motor.findOneAndUpdate(
        { _id: id, userId },
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!motor) {
        return res.status(404).json({ message: 'Motor not found' });
      }

      res.json(motor);
    } catch (error) {
      console.error('Update motor error:', error);
      res.status(500).json({ message: 'Server error updating motor' });
    }
  }

  // Delete motor
  async deleteMotor(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const motor = await Motor.findOneAndDelete({ _id: id, userId });
      if (!motor) {
        return res.status(404).json({ message: 'Motor not found' });
      }

      res.json({ message: 'Motor deleted successfully' });
    } catch (error) {
      console.error('Delete motor error:', error);
      res.status(500).json({ message: 'Server error deleting motor' });
    }
  }

  // Update fuel level
  async updateFuelLevel(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const { fuelLevel, distanceTraveled, tripId } = req.body;

      const motor = await Motor.findOne({ _id: id, userId });
      if (!motor) {
        return res.status(404).json({ message: 'Motor not found' });
      }

      // Calculate fuel consumption if distance is provided
      if (distanceTraveled && motor.fuelConsumption) {
        const fuelUsed = (distanceTraveled / motor.fuelConsumption) * 100;
        const newFuelLevel = Math.max(0, motor.currentFuelLevel - fuelUsed);
        motor.currentFuelLevel = newFuelLevel;
      } else {
        motor.currentFuelLevel = fuelLevel;
      }

      // Update analytics
      if (distanceTraveled) {
        motor.analytics.totalDistance += distanceTraveled;
        motor.analytics.lastUpdated = new Date();
      }

      await motor.save();

      res.json({
        message: 'Fuel level updated successfully',
        motor: {
          _id: motor._id,
          currentFuelLevel: motor.currentFuelLevel,
          analytics: motor.analytics
        }
      });
    } catch (error) {
      console.error('Update fuel level error:', error);
      res.status(500).json({ message: 'Server error updating fuel level' });
    }
  }

  // Get motor analytics
  async getMotorAnalytics(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const { period = '30d' } = req.query;

      const motor = await Motor.findOne({ _id: id, userId });
      if (!motor) {
        return res.status(404).json({ message: 'Motor not found' });
      }

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
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get trips for this motor in the period
      const trips = await Trip.find({
        motorId: id,
        userId,
        tripStartTime: { $gte: startDate }
      });

      // Get maintenance records
      const maintenanceRecords = await MaintenanceRecord.find({
        motorId: id,
        userId,
        timestamp: { $gte: startDate }
      });

      // Calculate analytics
      const totalDistance = trips.reduce((sum, trip) => sum + (trip.actualDistance || 0), 0);
      const totalTrips = trips.length;
      const avgDistancePerTrip = totalTrips > 0 ? totalDistance / totalTrips : 0;
      const totalFuelUsed = trips.reduce((sum, trip) => sum + (trip.actualFuelUsedMin || 0), 0);
      const avgFuelEfficiency = totalDistance > 0 ? totalDistance / totalFuelUsed : 0;

      const analytics = {
        period,
        totalDistance,
        totalTrips,
        avgDistancePerTrip,
        totalFuelUsed,
        avgFuelEfficiency,
        maintenanceRecords: maintenanceRecords.length,
        fuelLevel: motor.currentFuelLevel,
        lastUpdated: motor.analytics.lastUpdated
      };

      res.json(analytics);
    } catch (error) {
      console.error('Get motor analytics error:', error);
      res.status(500).json({ message: 'Server error getting motor analytics' });
    }
  }

  // Update motor analytics
  async updateMotorAnalytics(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const analyticsData = req.body;

      const motor = await Motor.findOneAndUpdate(
        { _id: id, userId },
        { 
          $set: { 
            analytics: { 
              ...motor.analytics, 
              ...analyticsData,
              lastUpdated: new Date()
            }
          }
        },
        { new: true }
      );

      if (!motor) {
        return res.status(404).json({ message: 'Motor not found' });
      }

      res.json(motor.analytics);
    } catch (error) {
      console.error('Update motor analytics error:', error);
      res.status(500).json({ message: 'Server error updating motor analytics' });
    }
  }
}

module.exports = new MotorController();
