const MaintenanceRecord = require('../models/MaintenanceRecord');
const Motor = require('../models/Motor');

class MaintenanceController {
  // Get all maintenance records for user
  async getMaintenanceRecords(req, res) {
    try {
      const userId = req.user.userId;
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
      const filter = { userId };
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
      const userId = req.user.userId;

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
      const userId = req.user.userId;
      const recordData = {
        ...req.body,
        userId,
        timestamp: req.body.timestamp || new Date(),
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
      res.status(500).json({ message: 'Server error creating maintenance record' });
    }
  }

  // Update maintenance record
  async updateMaintenanceRecord(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
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
      const userId = req.user.userId;

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

  // Get maintenance records for specific motor
  async getMotorMaintenance(req, res) {
    try {
      const { motorId } = req.params;
      const userId = req.user.userId;
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
      const userId = req.user.userId;
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
      const motor = await Motor.findById(motorId);
      if (!motor) return;

      // Calculate new fuel level based on tank capacity
      const tankCapacity = motor.fuelTank || 15; // Default 15L
      const currentLevel = motor.currentFuelLevel || 0;
      const fuelAdded = fuelQuantity;
      
      // Calculate new fuel level (percentage)
      const newFuelLevel = Math.min(100, ((currentLevel / 100) * tankCapacity + fuelAdded) / tankCapacity * 100);
      
      motor.currentFuelLevel = newFuelLevel;
      motor.analytics.lastUpdated = new Date();
      
      await motor.save();
    } catch (error) {
      console.error('Update motor fuel after refuel error:', error);
    }
  }
}

module.exports = new MaintenanceController();
