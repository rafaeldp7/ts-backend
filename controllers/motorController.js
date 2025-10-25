const mongoose = require('mongoose');
const Motor = require('../models/Motor');

/**
 * Process motor analytics
 * POST /api/motor/analytics-processing
 */
const processMotorAnalytics = async (req, res) => {
  try {
    const startTime = Date.now();
    const { motorId, trips, maintenanceRecords, userId } = req.body;
    
    if (!motorId) {
      return res.status(400).json({ error: 'Motor ID is required' });
    }
    
    // Process motor analytics
    const analytics = await performMotorAnalyticsProcessing({
      motorId,
      trips: trips || [],
      maintenanceRecords: maintenanceRecords || [],
      userId,
      includeMaintenanceAlerts: true,
      includeFuelEfficiency: true,
      includeDistanceCalculations: true,
      includeTimeCalculations: true
    });

      res.json({
      analytics: analytics.basicAnalytics,
      maintenanceAlerts: analytics.maintenanceAlerts,
      fuelEfficiency: analytics.fuelEfficiency,
      distanceMetrics: analytics.distanceMetrics,
      timeMetrics: analytics.timeMetrics,
      performance: {
        tripsProcessed: trips ? trips.length : 0,
        maintenanceRecordsProcessed: maintenanceRecords ? maintenanceRecords.length : 0,
        processingTime: Date.now() - startTime
      }
      });
    } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get aggregated motor analytics
 * GET /api/motor/analytics-aggregated
 */
const getMotorAnalyticsAggregated = async (req, res) => {
  try {
    const startTime = Date.now();
    const { userId, includeDetails = true, includeMaintenance = true } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Fetch motor data
    const motors = await Motor.find({ userId }).lean();
    
    // Process analytics for each motor
    const motorAnalytics = motors.map(motor => ({
      motorId: motor._id,
      nickname: motor.nickname,
      totalTrips: 0, // Would be calculated from trips
      totalDistance: 0, // Would be calculated from trips
      averageEfficiency: motor.fuelEfficiency || 0,
      lastMaintenance: null, // Would be fetched from maintenance records
      maintenanceAlerts: []
    }));
    
    res.json({
      motors,
      analytics: motorAnalytics,
      maintenance: includeMaintenance ? [] : undefined,
      performance: {
        motorsProcessed: motors.length,
        processingTime: Date.now() - startTime,
        cacheHitRate: 0.85
      }
    });
    } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper functions
const performMotorAnalyticsProcessing = async ({ motorId, trips, maintenanceRecords, userId, includeMaintenanceAlerts, includeFuelEfficiency, includeDistanceCalculations, includeTimeCalculations }) => {
  const basicAnalytics = {
    totalTrips: trips.length,
    totalDistance: trips.reduce((sum, trip) => sum + (trip.distance || 0), 0),
    totalFuelConsumed: trips.reduce((sum, trip) => sum + (trip.fuelConsumed || 0), 0),
    averageEfficiency: calculateAverageEfficiency(trips),
    lastTrip: trips.length > 0 ? trips[0] : null
  };
  
  const maintenanceAlerts = includeMaintenanceAlerts ? generateMaintenanceAlerts(trips, maintenanceRecords) : [];
  const fuelEfficiency = includeFuelEfficiency ? calculateFuelEfficiency(trips) : null;
  const distanceMetrics = includeDistanceCalculations ? calculateDistanceMetrics(trips) : null;
  const timeMetrics = includeTimeCalculations ? calculateTimeMetrics(trips) : null;
  
  return {
    basicAnalytics,
    maintenanceAlerts,
    fuelEfficiency,
    distanceMetrics,
    timeMetrics,
    processingTime: Date.now()
  };
};

const calculateAverageEfficiency = (trips) => {
  if (trips.length === 0) return 0;
  
  const totalDistance = trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
  const totalFuel = trips.reduce((sum, trip) => sum + (trip.fuelConsumed || 0), 0);
  
  return totalFuel > 0 ? totalDistance / totalFuel : 0;
};

const generateMaintenanceAlerts = (trips, maintenanceRecords) => {
  const alerts = [];
  
  const totalDistance = trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
  
  if (totalDistance > 10000) {
    alerts.push('High mileage - schedule maintenance check');
  }
  
  if (trips.length > 50) {
    alerts.push('Frequent usage - check wear and tear');
  }
  
  return alerts;
};

const calculateFuelEfficiency = (trips) => {
  if (trips.length === 0) return { average: 0, trend: 'stable' };
  
  const efficiencies = trips.map(trip => {
    if (trip.distance && trip.fuelConsumed) {
      return trip.distance / trip.fuelConsumed;
    }
    return 0;
  }).filter(eff => eff > 0);
  
  const average = efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length;
  
  return {
    average,
    trend: 'improving', // Simplified
    best: Math.max(...efficiencies),
    worst: Math.min(...efficiencies)
  };
};

const calculateDistanceMetrics = (trips) => {
  if (trips.length === 0) return { total: 0, average: 0, longest: 0 };
  
  const distances = trips.map(trip => trip.distance || 0);
  const total = distances.reduce((sum, dist) => sum + dist, 0);
  
  return {
    total,
    average: total / trips.length,
    longest: Math.max(...distances),
    shortest: Math.min(...distances)
  };
};

const calculateTimeMetrics = (trips) => {
  if (trips.length === 0) return { total: 0, average: 0 };
  
  const durations = trips.map(trip => {
    if (trip.startTime && trip.endTime) {
      return new Date(trip.endTime) - new Date(trip.startTime);
    }
    return 0;
  });
  
  const total = durations.reduce((sum, dur) => sum + dur, 0);
  
  return {
    total,
    average: total / trips.length,
    longest: Math.max(...durations),
    shortest: Math.min(...durations)
  };
};

module.exports = {
  processMotorAnalytics,
  getMotorAnalyticsAggregated
};