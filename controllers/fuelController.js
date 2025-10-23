const mongoose = require('mongoose');
const FuelLogModel = require('../models/FuelLogModel');

/**
 * Calculate fuel consumption
 * POST /api/fuel/calculate
 */
const calculateFuelConsumption = async (req, res) => {
  try {
    const startTime = Date.now();
    const { motorData, distanceTraveled, refuelData } = req.body;
    
    if (!motorData || !distanceTraveled) {
      return res.status(400).json({ error: 'Motor data and distance traveled are required' });
    }
    
    const { fuelEfficiency, fuelTank, currentFuelLevel } = motorData;
    
    if (!fuelEfficiency || !fuelTank) {
      return res.status(400).json({ error: 'Motor fuel efficiency and tank capacity are required' });
    }
    
    // Calculate fuel consumption
    const fuelConsumed = distanceTraveled / fuelEfficiency; // in liters
    const fuelConsumedPercentage = (fuelConsumed / fuelTank) * 100;
    const newFuelLevel = Math.max(0, currentFuelLevel - fuelConsumedPercentage);
    const remainingDistance = newFuelLevel * fuelEfficiency;
    
    // Generate recommendations
    const recommendations = [];
    if (newFuelLevel < 20) {
      recommendations.push('Low fuel level - consider refueling soon');
    }
    if (newFuelLevel < 10) {
      recommendations.push('Very low fuel - refuel immediately');
    }
    if (fuelConsumedPercentage > 50) {
      recommendations.push('High fuel consumption - check vehicle efficiency');
    }
    
    res.json({
      newFuelLevel,
      fuelConsumed,
      remainingDistance,
      recommendations,
      calculations: {
        totalDrivableDistance: fuelEfficiency * fuelTank,
        fuelEfficiency,
        tankCapacity: fuelTank
      },
      processingTime: Date.now() - startTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Combine fuel data from multiple sources
 * POST /api/fuel/combine-data
 */
const combineFuelData = async (req, res) => {
  try {
    const startTime = Date.now();
    const { fuelLogs, maintenanceRecords, userId } = req.body;
    
    if (!fuelLogs && !maintenanceRecords) {
      return res.status(400).json({ error: 'Fuel logs or maintenance records are required' });
    }
    
    // Filter maintenance records for refuel type only
    const maintenanceRefuels = (maintenanceRecords || []).filter(record => record.type === 'refuel');
    
    // Transform maintenance refuels to match fuel log format
    const transformedMaintenanceRefuels = maintenanceRefuels.map(record => ({
      _id: `maintenance_${record._id}`,
      date: record.timestamp,
      liters: record.details.quantity,
      pricePerLiter: record.details.cost / record.details.quantity,
      totalCost: record.details.cost,
      odometer: undefined,
      notes: record.details.notes,
      motorId: {
        _id: record.motorId._id,
        nickname: record.motorId.nickname,
        motorcycleId: undefined
      },
      location: record.location ? `${record.location.latitude}, ${record.location.longitude}` : undefined,
      source: 'maintenance'
    }));
    
    // Combine both data sources
    const combined = [
      ...(fuelLogs || []).map(log => ({ ...log, source: 'fuel_log' })),
      ...transformedMaintenanceRefuels
    ];
    
    // Sort by date (newest first)
    const sortedData = combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Calculate statistics
    const statistics = {
      fuelLogsCount: fuelLogs ? fuelLogs.length : 0,
      maintenanceRefuelsCount: maintenanceRefuels.length,
      totalRecords: sortedData.length,
      totalCost: sortedData.reduce((sum, record) => sum + (record.totalCost || 0), 0),
      totalLiters: sortedData.reduce((sum, record) => sum + (record.liters || 0), 0),
      averagePricePerLiter: sortedData.length > 0 ? 
        sortedData.reduce((sum, record) => sum + (record.pricePerLiter || 0), 0) / sortedData.length : 0
    };
    
    res.json({
      combinedData: sortedData,
      statistics,
      performance: {
        originalDataSize: (fuelLogs ? fuelLogs.length : 0) + (maintenanceRecords ? maintenanceRecords.length : 0),
        processedDataSize: sortedData.length,
        transformationTime: Date.now() - startTime
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Calculate fuel level after refuel
 * POST /api/fuel/calculate-after-refuel
 */
const calculateFuelLevelAfterRefuel = async (req, res) => {
  try {
    const startTime = Date.now();
    const { motorData, refuelAmount } = req.body;
    
    if (!motorData || !refuelAmount) {
      return res.status(400).json({ error: 'Motor data and refuel amount are required' });
    }
    
    const { fuelTank, currentFuelLevel } = motorData;
    
    if (!fuelTank) {
      return res.status(400).json({ error: 'Motor tank capacity is required' });
    }
    
    // Calculate new fuel level
    const currentFuelLiters = (currentFuelLevel / 100) * fuelTank;
    const newFuelLiters = Math.min(fuelTank, currentFuelLiters + refuelAmount);
    const newFuelLevel = (newFuelLiters / fuelTank) * 100;
    
    // Calculate remaining capacity
    const remainingCapacity = fuelTank - newFuelLiters;
    const refuelEfficiency = (refuelAmount / fuelTank) * 100;
    
    res.json({
      newFuelLevel,
      newFuelLiters,
      remainingCapacity,
      refuelEfficiency,
      isTankFull: newFuelLevel >= 100,
      calculations: {
        currentFuelLiters,
        fuelTank,
        refuelAmount
      },
      processingTime: Date.now() - startTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Calculate drivable distance
 * POST /api/fuel/calculate-drivable-distance
 */
const calculateDrivableDistance = async (req, res) => {
  try {
    const startTime = Date.now();
    const { motorData } = req.body;
    
    if (!motorData) {
      return res.status(400).json({ error: 'Motor data is required' });
    }
    
    const { fuelEfficiency, fuelTank, currentFuelLevel } = motorData;
    
    if (!fuelEfficiency || !fuelTank) {
      return res.status(400).json({ error: 'Motor fuel efficiency and tank capacity are required' });
    }
    
    // Calculate drivable distance
    const currentFuelLiters = (currentFuelLevel / 100) * fuelTank;
    const drivableDistance = currentFuelLiters * fuelEfficiency;
    const maxDrivableDistance = fuelTank * fuelEfficiency;
    
    // Generate recommendations
    const recommendations = [];
    if (drivableDistance < 100) {
      recommendations.push('Very low range - refuel immediately');
    } else if (drivableDistance < 200) {
      recommendations.push('Low range - consider refueling soon');
    } else if (drivableDistance > 500) {
      recommendations.push('Good range - safe for long trips');
    }
    
    res.json({
      drivableDistance,
      maxDrivableDistance,
      currentFuelLiters,
      fuelEfficiency,
      recommendations,
      calculations: {
        fuelTank,
        currentFuelLevel,
        efficiency: fuelEfficiency
      },
      processingTime: Date.now() - startTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  calculateFuelConsumption,
  combineFuelData,
  calculateFuelLevelAfterRefuel,
  calculateDrivableDistance
};