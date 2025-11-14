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
      if (location.latitude !== undefined || location.longitude !== undefined || location.lat || location.lng) {
        location = {
          lat: location.latitude || location.lat,
          lng: location.longitude || location.lng,
          latitude: location.latitude || location.lat,
          longitude: location.longitude || location.lng,
          address: location.address || req.body.address
        };
      }
      
      // Get odometer from UserMotor if not provided
      let odometer = req.body.odometer;
      if (!odometer) {
        const userMotor = await UserMotor.findById(req.body.motorId);
        if (userMotor) {
          odometer = userMotor.currentOdometer || 0;
        }
      }
      
      const recordData = {
        ...req.body,
        userId,
        timestamp,
        odometer: odometer,
        location: location,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const record = new MaintenanceRecord(recordData);
      await record.save();

      // Populate motor data
      await record.populate('motorId', 'nickname brand model');

      // Update motor fuel level if it's a refuel
      if (record.type === 'refuel' && record.details.quantity) {
        await MaintenanceController.updateMotorFuelAfterRefuel(record.motorId, record.details.quantity);
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
      // Get userId from authenticated user, query params, or request body (for flexibility)
      const userId = req.user?.userId || req.query.userId || req.body.userId;
      const { 
        page = 1, 
        limit = 10, 
        type,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object - motorId is required, userId is optional
      const filter = { motorId };
      if (userId) filter.userId = userId;
      if (type) filter.type = type;

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const records = await MaintenanceRecord.find(filter)
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('motorId', 'nickname plateNumber')
        .lean(); // Use lean() for better performance and to ensure all fields are returned

      const total = await MaintenanceRecord.countDocuments(filter);

      res.json({
        records,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
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
      // Support both query params (frontend) and params (backward compatibility)
      const motorId = req.query.motorId || req.params.motorId;
      const userId = req.query.userId || req.user?.userId;
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

      // Build filter - motorId and userId are optional
      const filter = { timestamp: { $gte: startDate } };
      if (motorId) filter.motorId = motorId;
      if (userId) filter.userId = userId;

      // Get maintenance records for the period
      const records = await MaintenanceRecord.find(filter);

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

      // Calculate counts for all maintenance types
      const allTypes = ['refuel', 'oil_change', 'tune_up', 'tire_rotation', 'brake_service', 'repair', 'other'];
      const recordsByType = {};
      allTypes.forEach(type => {
        recordsByType[type] = records.filter(r => r.type === type).length;
      });

      // Get upcoming services from records with nextServiceDate
      const upcomingServices = records
        .filter(r => r.details?.nextServiceDate)
        .map(r => ({
          motorId: r.motorId,
          nextServiceDate: r.details.nextServiceDate,
          type: r.type
        }))
        .sort((a, b) => new Date(a.nextServiceDate) - new Date(b.nextServiceDate));

      const analytics = {
        period,
        totalRecords,
        totalCost,
        totalFuelAdded,
        avgCostPerRefuel,
        refuelCount: refuelRecords.length,
        oilChangeCount: oilChangeRecords.length,
        tuneUpCount: tuneUpRecords.length,
        byType: recordsByType, // Frontend expects 'byType' not 'recordsByType'
        recordsByType: recordsByType, // Keep for backward compatibility
        upcomingServices,
        recentRecords: records.slice(0, 5) // Last 5 records
      };

      res.json(analytics);
    } catch (error) {
      console.error('Get maintenance analytics error:', error);
      res.status(500).json({ message: 'Server error getting maintenance analytics' });
    }
  }

  // Helper method to update motor fuel after refuel (static method to avoid 'this' binding issues)
  static async updateMotorFuelAfterRefuel(motorId, fuelQuantity) {
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

  // Get last maintenance records (refuel, oil change, tune-up) for a user
  // Optionally filter by motorId via query parameter
  async getLastMaintenanceRecords(req, res) {
    try {
      const { userId } = req.params;
      // Optional motorId filter from query params
      const { motorId } = req.query;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      // Build base filter
      const baseFilter = { userId };
      if (motorId) baseFilter.motorId = motorId;

      // Get last refuel record
      const lastRefuel = await MaintenanceRecord.findOne({ 
        ...baseFilter,
        type: 'refuel' 
      })
        .sort({ timestamp: -1 })
        .lean();

      // Get last oil change record
      const lastOilChange = await MaintenanceRecord.findOne({ 
        ...baseFilter,
        type: 'oil_change' 
      })
        .sort({ timestamp: -1 })
        .lean();

      // Get last tune-up record
      const lastTuneUp = await MaintenanceRecord.findOne({ 
        ...baseFilter,
        type: 'tune_up' 
      })
        .sort({ timestamp: -1 })
        .lean();

      // Build response with full record data
      const response = {
        lastRefuel: lastRefuel ? {
          _id: lastRefuel._id,
          userId: lastRefuel.userId,
          motorId: lastRefuel.motorId,
          type: lastRefuel.type,
          timestamp: lastRefuel.timestamp,
          odometer: lastRefuel.odometer || 0,
          location: lastRefuel.location || {},
          details: lastRefuel.details || {},
          createdAt: lastRefuel.createdAt,
          updatedAt: lastRefuel.updatedAt
        } : null,
        lastOilChange: lastOilChange ? {
          _id: lastOilChange._id,
          userId: lastOilChange.userId,
          motorId: lastOilChange.motorId,
          type: lastOilChange.type,
          timestamp: lastOilChange.timestamp,
          odometer: lastOilChange.odometer || 0,
          location: lastOilChange.location || {},
          details: lastOilChange.details || {},
          createdAt: lastOilChange.createdAt,
          updatedAt: lastOilChange.updatedAt
        } : null,
        lastTuneUp: lastTuneUp ? {
          _id: lastTuneUp._id,
          userId: lastTuneUp.userId,
          motorId: lastTuneUp.motorId,
          type: lastTuneUp.type,
          timestamp: lastTuneUp.timestamp,
          odometer: lastTuneUp.odometer || 0,
          location: lastTuneUp.location || {},
          details: lastTuneUp.details || {},
          createdAt: lastTuneUp.createdAt,
          updatedAt: lastTuneUp.updatedAt
        } : null
      };

      res.json(response);
    } catch (error) {
      console.error('Get last maintenance records error:', error);
      res.status(500).json({ message: 'Server error getting last maintenance records' });
    }
  }

  // Get last maintenance records (refuel, oil change, tune-up) for a specific motor
  // Similar to getLastMaintenanceRecords but filters by motorId instead of userId
  async getLastMotorMaintenanceRecords(req, res) {
    try {
      const { motorId } = req.params;
      // Optional userId filter from query params
      const { userId } = req.query;

      if (!motorId) {
        return res.status(400).json({ message: 'Motor ID is required' });
      }

      // Build base filter
      const baseFilter = { motorId };
      if (userId) baseFilter.userId = userId;

      // Get last refuel record
      const lastRefuel = await MaintenanceRecord.findOne({ 
        ...baseFilter,
        type: 'refuel' 
      })
        .sort({ timestamp: -1 })
        .lean();

      // Get last oil change record
      const lastOilChange = await MaintenanceRecord.findOne({ 
        ...baseFilter,
        type: 'oil_change' 
      })
        .sort({ timestamp: -1 })
        .lean();

      // Get last tune-up record
      const lastTuneUp = await MaintenanceRecord.findOne({ 
        ...baseFilter,
        type: 'tune_up' 
      })
        .sort({ timestamp: -1 })
        .lean();

      // Build response with specific fields as per requirements
      const response = {
        lastRefuel: lastRefuel ? {
          cost: lastRefuel.details?.cost || 0,
          liters: lastRefuel.details?.quantity || 0,
          costPerLiter: lastRefuel.details?.costPerLiter || 0,
          date: lastRefuel.timestamp
        } : null,
        lastOilChange: lastOilChange ? {
          cost: lastOilChange.details?.cost || 0,
          date: lastOilChange.timestamp
        } : null,
        lastTuneUp: lastTuneUp ? {
          cost: lastTuneUp.details?.cost || 0,
          date: lastTuneUp.timestamp
        } : null
      };

      res.json(response);
    } catch (error) {
      console.error('Get last motor maintenance records error:', error);
      res.status(500).json({ message: 'Server error getting last motor maintenance records' });
    }
  }

  // Get last maintenance record for a specific motor (by motorId)
  // Returns the most recent maintenance record of any type for the motor
  async getLastMotorMaintenanceRecord(req, res) {
    try {
      const { motorId } = req.params;
      // Optional userId filter from query params
      const { userId, type } = req.query;

      if (!motorId) {
        return res.status(400).json({ message: 'Motor ID is required' });
      }

      // Build filter
      const filter = { motorId };
      if (userId) filter.userId = userId;
      if (type) filter.type = type;

      // Get last maintenance record
      const lastRecord = await MaintenanceRecord.findOne(filter)
        .sort({ timestamp: -1 })
        .populate('motorId', 'nickname plateNumber')
        .lean();

      if (!lastRecord) {
        return res.status(404).json({ 
          message: 'No maintenance records found for this motor',
          motorId 
        });
      }

      res.json(lastRecord);
    } catch (error) {
      console.error('Get last motor maintenance record error:', error);
      res.status(500).json({ message: 'Server error getting last motor maintenance record' });
    }
  }

  // Get oil change countdown for a motor
  async getOilChangeCountdown(req, res) {
    try {
      const { motorId } = req.params;

      if (!motorId) {
        return res.status(400).json({ message: 'Motor ID is required' });
      }

      // Get the motor to access current odometer
      const motor = await UserMotor.findById(motorId);
      if (!motor) {
        return res.status(404).json({ message: 'Motor not found' });
      }

      // Get last oil change record
      const lastOilChange = await MaintenanceRecord.findOne({ 
        motorId, 
        type: 'oil_change' 
      })
        .sort({ timestamp: -1 });

      if (!lastOilChange) {
        // No oil change record found
        return res.json({
          motorId,
          kmSinceLastOilChange: null,
          daysSinceLastOilChange: null,
          needsOilChange: true,
          remainingKm: 3000,
          remainingDays: 90,
          message: 'No previous oil change record found'
        });
      }

      // Calculate days since last oil change
      const now = new Date();
      const lastOilChangeDate = new Date(lastOilChange.timestamp);
      const daysSinceLastOilChange = Math.floor((now - lastOilChangeDate) / (1000 * 60 * 60 * 24));

      // Calculate km since last oil change by summing trip distances
      // Import Trip model
      const TripModel = require('../models/TripModel');
      
      // Get all trips for this motor since last oil change
      const tripsSinceLastOilChange = await TripModel.find({
        motorId,
        tripStartTime: { $gte: lastOilChangeDate },
        status: 'completed'
      }).select('actualDistance distance');

      // Sum up distances from trips
      const kmSinceLastOilChange = tripsSinceLastOilChange.reduce((total, trip) => {
        const distance = trip.actualDistance || trip.distance || 0;
        return total + distance;
      }, 0);

      // Check if oil change is needed (3000 km or 90 days)
      const needsOilChange = kmSinceLastOilChange >= 3000 || daysSinceLastOilChange >= 90;

      // Calculate remaining values
      const remainingKm = Math.max(0, 3000 - kmSinceLastOilChange);
      const remainingDays = Math.max(0, 90 - daysSinceLastOilChange);

      res.json({
        motorId,
        kmSinceLastOilChange,
        daysSinceLastOilChange,
        needsOilChange,
        remainingKm,
        remainingDays,
        lastOilChangeDate: lastOilChange.timestamp
      });
    } catch (error) {
      console.error('Get oil change countdown error:', error);
      res.status(500).json({ message: 'Server error getting oil change countdown' });
    }
  }

  // Refuel endpoint with automatic quantity calculation
  async refuel(req, res) {
    try {
      const { userMotorId, price, costPerLiter } = req.body;

      // Validation
      if (!userMotorId) {
        return res.status(400).json({ message: 'userMotorId is required' });
      }

      if (!price || price <= 0) {
        return res.status(400).json({ message: 'price must be a positive number' });
      }

      if (!costPerLiter || costPerLiter <= 0) {
        return res.status(400).json({ message: 'costPerLiter must be a positive number' });
      }

      // Calculate quantity
      const quantity = price / costPerLiter;

      // Get UserMotor and populate motorcycleId to access fuelTank
      const userMotor = await UserMotor.findById(userMotorId).populate('motorcycleId');
      
      if (!userMotor) {
        return res.status(404).json({ message: 'UserMotor not found' });
      }

      if (!userMotor.motorcycleId) {
        return res.status(400).json({ message: 'Motorcycle information not found for this motor' });
      }

      // Get fuel tank capacity
      const fuelTank = userMotor.motorcycleId.fuelTank;
      
      if (!fuelTank || fuelTank <= 0) {
        return res.status(400).json({ message: 'Fuel tank capacity is missing or invalid' });
      }

      // Calculate refueled percentage
      const refueledPercent = (quantity / fuelTank) * 100;

      // Get current fuel level (percentage)
      const currentFuelLevel = userMotor.currentFuelLevel || 0;

      // Calculate new fuel level (capped at 100%)
      const newFuelLevel = Math.min(currentFuelLevel + refueledPercent, 100);

      // Update the currentFuelLevel in UserMotor
      userMotor.currentFuelLevel = newFuelLevel;
      
      if (userMotor.analytics) {
        userMotor.analytics.lastUpdated = new Date();
      }
      
      await userMotor.save();

      // Create maintenance record for the refuel
      const userId = userMotor.userId;
      
      // Get odometer reading from UserMotor
      const odometer = userMotor.currentOdometer || 0;
      
      // Get location from request body if provided
      const location = req.body.location || {};
      
      const recordData = {
        userId,
        motorId: userMotorId,
        type: 'refuel',
        timestamp: new Date(),
        odometer: odometer,
        location: {
          lat: location.lat || location.latitude,
          lng: location.lng || location.longitude,
          latitude: location.latitude || location.lat,
          longitude: location.longitude || location.lng,
          address: location.address || req.body.address
        },
        details: {
          cost: price,
          quantity: parseFloat(quantity.toFixed(2)),
          costPerLiter: costPerLiter,
          fuelTank: fuelTank,
          refueledPercent: parseFloat(refueledPercent.toFixed(2)),
          fuelLevelBefore: parseFloat(currentFuelLevel.toFixed(2)),
          fuelLevelAfter: parseFloat(newFuelLevel.toFixed(2)),
          notes: req.body.notes || req.body.details?.notes,
          serviceProvider: req.body.serviceProvider || req.body.details?.serviceProvider
        }
      };

      const record = new MaintenanceRecord(recordData);
      await record.save();

      // Return response with computed data
      res.status(201).json({
        userMotorId,
        quantity: parseFloat(quantity.toFixed(2)),
        fuelTank,
        refueledPercent: parseFloat(refueledPercent.toFixed(2)),
        newFuelLevel: parseFloat(newFuelLevel.toFixed(2)),
        maintenanceRecord: record
      });
    } catch (error) {
      console.error('Refuel error:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: Object.values(error.errors).map(e => e.message) 
        });
      }
      
      res.status(500).json({ message: 'Server error processing refuel' });
    }
  }
}

module.exports = new MaintenanceController();
