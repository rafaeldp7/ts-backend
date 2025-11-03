const MaintenanceRecord = require('../models/maintenanceModel');
const Motor = require('../models/Motor');
const UserMotor = require('../models/userMotorModel');

class MaintenanceController {
  // Get all maintenance records for user
  async getMaintenanceRecords(req, res) {
    try {
      const userId = req.user?.userId;
      const { 
        page = 1, 
        limit = 10, 
        type,
        motorId,
        sortBy = 'timestamp',
        sortOrder = 'desc',
        startDate,
        endDate
      } = req.query;

      // Build filter object
      const filter = {};
      if (userId) filter.userId = userId;
      if (type) filter.type = type;
      if (motorId) filter.motorId = motorId;
      
      // Add date range filter
      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = new Date(startDate);
        if (endDate) filter.timestamp.$lte = new Date(endDate);
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const records = await MaintenanceRecord.find(filter)
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('motorId', 'nickname brand model');

      const total = await MaintenanceRecord.countDocuments(filter);

      res.json({
        records,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Get maintenance records error:', error);
      res.status(500).json({ message: 'Server error getting maintenance records' });
    }
  }

  // Get single maintenance record
  async getMaintenanceRecord(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const record = await MaintenanceRecord.findOne({ _id: id, userId })
        .populate('motorId', 'nickname brand model');

      if (!record) {
        return res.status(404).json({ message: 'Maintenance record not found' });
      }

      res.json(record);
    } catch (error) {
      console.error('Get maintenance record error:', error);
      res.status(500).json({ message: 'Server error getting maintenance record' });
    }
  }

  // Create new maintenance record
  async createMaintenanceRecord(req, res) {
    try {
      // Get userId from authenticated user or request body (fallback)
      const userId = req.user?.userId || req.user?.id || req.body.userId;
      
      // Validate required fields
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      if (!req.body.motorId) {
        return res.status(400).json({ message: 'Motor ID is required' });
      }
      
      if (!req.body.type) {
        return res.status(400).json({ message: 'Maintenance type is required' });
      }
      
      if (!['refuel', 'oil_change', 'tune_up'].includes(req.body.type)) {
        return res.status(400).json({ message: 'Invalid maintenance type. Must be: refuel, oil_change, or tune_up' });
      }
      
      if (!req.body.details || !req.body.details.cost) {
        return res.status(400).json({ message: 'Cost is required' });
      }
      
      // Validate type-specific requirements
      if (req.body.type === 'refuel') {
        if (!req.body.details.quantity && !req.body.details.costPerLiter) {
          return res.status(400).json({ message: 'For refuel type, either quantity or costPerLiter is required' });
        }
      }
      
      if (req.body.type === 'oil_change' && !req.body.details.quantity) {
        return res.status(400).json({ message: 'Quantity is required for oil change type' });
      }
      
      // Convert timestamp from milliseconds to Date if needed
      let timestamp = req.body.timestamp;
      if (typeof timestamp === 'number') {
        timestamp = new Date(timestamp);
      } else if (timestamp) {
        timestamp = new Date(timestamp);
      } else {
        timestamp = new Date();
      }
      
      // Normalize location format (support both latitude/longitude and lat/lng)
      let location = req.body.location || {};
      if (location.latitude !== undefined || location.longitude !== undefined) {
        location = {
          lat: location.latitude || location.lat,
          lng: location.longitude || location.lng,
          latitude: location.latitude,
          longitude: location.longitude
        };
      }
      
      const recordData = {
        ...req.body,
        userId,
        timestamp,
        location,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const record = new MaintenanceRecord(recordData);
      await record.save();

      // Populate motor data
      await record.populate('motorId', 'nickname brand model');

      // Update motor fuel level if it's a refuel
      if (record.type === 'refuel' && record.details.quantity) {
        await this.updateMotorFuelAfterRefuel(record.motorId, record.details.quantity);
      }

      res.status(201).json(record);
    } catch (error) {
      console.error('Create maintenance record error:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: Object.values(error.errors).map(e => e.message) 
        });
      }
      
      res.status(500).json({ message: 'Server error creating maintenance record' });
    }
  }

  // Update maintenance record
  async updateMaintenanceRecord(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const updates = { ...req.body, updatedAt: new Date() };

      const record = await MaintenanceRecord.findOneAndUpdate(
        { _id: id, userId },
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('motorId', 'nickname brand model');

      if (!record) {
        return res.status(404).json({ message: 'Maintenance record not found' });
      }

      res.json(record);
    } catch (error) {
      console.error('Update maintenance record error:', error);
      res.status(500).json({ message: 'Server error updating maintenance record' });
    }
  }

  // Delete maintenance record
  async deleteMaintenanceRecord(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const record = await MaintenanceRecord.findOneAndDelete({ _id: id, userId });
      if (!record) {
        return res.status(404).json({ message: 'Maintenance record not found' });
      }

      res.json({ message: 'Maintenance record deleted successfully' });
    } catch (error) {
      console.error('Delete maintenance record error:', error);
      res.status(500).json({ message: 'Server error deleting maintenance record' });
    }
  }

  // Get maintenance records for specific user (frontend expects this)
  async getUserMaintenanceRecords(req, res) {
    try {
      const { userId } = req.params;
      
      const records = await MaintenanceRecord.find({ userId })
        .populate('motorId', 'nickname plateNumber')
        .sort({ timestamp: -1 });

      // Return array directly as frontend expects
      res.json(records);
    } catch (error) {
      console.error('Get user maintenance records error:', error);
      res.status(500).json({ message: 'Server error getting maintenance records' });
    }
  }

  // Get maintenance records for specific motor
  async getMotorMaintenance(req, res) {
    try {
      const { motorId } = req.params;
      const userId = req.user?.userId;
      const { 
        page = 1, 
        limit = 10, 
        type,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter = { motorId, userId };
      if (type) filter.type = type;

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const records = await MaintenanceRecord.find(filter)
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('motorId', 'nickname brand model');

      const total = await MaintenanceRecord.countDocuments(filter);

      res.json({
        records,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Get motor maintenance error:', error);
      res.status(500).json({ message: 'Server error getting motor maintenance' });
    }
  }

  // Get maintenance analytics for motor
  async getMaintenanceAnalytics(req, res) {
    try {
      const { motorId } = req.params;
      const userId = req.user?.userId;
      const { period = '30d' } = req.query;

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

      // Get maintenance records for the period
      const records = await MaintenanceRecord.find({
        motorId,
        userId,
        timestamp: { $gte: startDate }
      });

      // Calculate analytics
      const totalRecords = records.length;
      const refuelRecords = records.filter(r => r.type === 'refuel');
      const oilChangeRecords = records.filter(r => r.type === 'oil_change');
      const tuneUpRecords = records.filter(r => r.type === 'tune_up');

      const totalCost = records.reduce((sum, record) => sum + (record.details.cost || 0), 0);
      const totalFuelAdded = refuelRecords.reduce((sum, record) => sum + (record.details.quantity || 0), 0);
      const avgCostPerRefuel = refuelRecords.length > 0 
        ? refuelRecords.reduce((sum, record) => sum + (record.details.cost || 0), 0) / refuelRecords.length 
        : 0;

      const analytics = {
        period,
        totalRecords,
        totalCost,
        totalFuelAdded,
        avgCostPerRefuel,
        refuelCount: refuelRecords.length,
        oilChangeCount: oilChangeRecords.length,
        tuneUpCount: tuneUpRecords.length,
        recordsByType: {
          refuel: refuelRecords.length,
          oil_change: oilChangeRecords.length,
          tune_up: tuneUpRecords.length
        },
        recentRecords: records.slice(0, 5) // Last 5 records
      };

      res.json(analytics);
    } catch (error) {
      console.error('Get maintenance analytics error:', error);
      res.status(500).json({ message: 'Server error getting maintenance analytics' });
    }
  }

  // Helper method to update motor fuel after refuel
  async updateMotorFuelAfterRefuel(motorId, fuelQuantity) {
    try {
      // Try UserMotor first (as frontend uses this)
      let motor = await UserMotor.findById(motorId).populate('motorcycleId');
      
      if (!motor) {
        // Fallback to Motor model
        motor = await Motor.findById(motorId);
        if (!motor) {
          console.error('Motor not found:', motorId);
          return;
        }
      }

      // Get tank capacity and current fuel level
      let tankCapacity, currentLevel;
      
      if (motor.motorcycleId) {
        // UserMotor with populated motorcycleId
        tankCapacity = motor.motorcycleId.fuelTankCapacity || motor.motorcycleId.fuelTank || 15;
        currentLevel = motor.currentFuelLevel || 0;
      } else if (motor.fuelTank) {
        // Motor model
        tankCapacity = motor.fuelTank || 15;
        currentLevel = motor.currentFuelLevel || 0;
      } else {
        // Default values
        tankCapacity = 15;
        currentLevel = 0;
      }
      
      const fuelAdded = fuelQuantity;
      
      // Calculate new fuel level (percentage)
      // Convert current level to liters, add fuel, then convert back to percentage
      const currentLiters = (currentLevel / 100) * tankCapacity;
      const newLiters = currentLiters + fuelAdded;
      const newFuelLevel = Math.min(100, (newLiters / tankCapacity) * 100);
      
      motor.currentFuelLevel = newFuelLevel;
      
      if (motor.analytics) {
        motor.analytics.lastUpdated = new Date();
      }
      
      await motor.save();
    } catch (error) {
      console.error('Update motor fuel after refuel error:', error);
    }
  }
}

module.exports = new MaintenanceController();
