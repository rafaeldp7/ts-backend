const mongoose = require('mongoose');
const TripModel = require('../models/TripModel');

/**
 * Calculate trip statistics
 * POST /api/trip/calculate-statistics
 */
const calculateTripStatistics = async (req, res) => {
  try {
    const startTime = Date.now();
    const { tripData, motorData, locationData } = req.body;
    
    if (!tripData) {
      return res.status(400).json({ error: 'Trip data is required' });
    }
    
    const { startTime: tripStart, endTime: tripEnd, coordinates } = tripData;
    const { fuelEfficiency, fuelTank, currentFuelLevel } = motorData || {};
    
    // Calculate duration
    const duration = new Date(tripEnd) - new Date(tripStart);
    const durationMinutes = Math.floor(duration / 60000);
    const durationHours = Math.floor(durationMinutes / 60);
    
    // Calculate total distance
    let totalDistance = 0;
    if (coordinates && coordinates.length > 1) {
      for (let i = 1; i < coordinates.length; i++) {
        const dist = calculateDistance(
          coordinates[i-1].latitude, coordinates[i-1].longitude,
          coordinates[i].latitude, coordinates[i].longitude
        );
        totalDistance += dist;
      }
    }
    
    // Calculate fuel consumption
    let fuelConsumed = 0;
    let newFuelLevel = currentFuelLevel;
    if (fuelEfficiency && totalDistance > 0) {
      fuelConsumed = totalDistance / fuelEfficiency;
      const fuelConsumedPercentage = (fuelConsumed / fuelTank) * 100;
      newFuelLevel = Math.max(0, currentFuelLevel - fuelConsumedPercentage);
    }
    
    // Calculate average speed
    const averageSpeed = totalDistance / (duration / 3600000); // km/h
    
    // Generate maintenance alerts
    const maintenanceAlerts = [];
    if (motorData) {
      if (totalDistance > 1000) {
        maintenanceAlerts.push('Consider checking tire pressure after long trip');
      }
      if (averageSpeed > 100) {
        maintenanceAlerts.push('High speed detected - check brake system');
      }
    }
    
    res.json({
      duration: {
        total: duration,
        minutes: durationMinutes,
        hours: durationHours,
        formatted: `${durationHours}h ${durationMinutes % 60}m`
      },
      distance: {
        total: totalDistance,
        kilometers: totalDistance / 1000
      },
      fuel: {
        consumed: fuelConsumed,
        newLevel: newFuelLevel,
        efficiency: fuelEfficiency
      },
      speed: {
        average: averageSpeed
      },
      maintenanceAlerts,
      recommendations: generateTripRecommendations(totalDistance, averageSpeed, fuelConsumed),
      processingTime: Date.now() - startTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generate trip summary
 * POST /api/trip/summary-analysis
 */
const generateTripSummary = async (req, res) => {
  try {
    const startTime = Date.now();
    const { tripData, motorData, locationData, maintenanceData } = req.body;
    
    if (!tripData) {
      return res.status(400).json({ error: 'Trip data is required' });
    }
    
    const { startTime: tripStart, endTime: tripEnd, coordinates } = tripData;
    
    // Calculate basic statistics
    const duration = new Date(tripEnd) - new Date(tripStart);
    const durationHours = Math.floor(duration / 3600000);
    const durationMinutes = Math.floor((duration % 3600000) / 60000);
    
    let totalDistance = 0;
    if (coordinates && coordinates.length > 1) {
      for (let i = 1; i < coordinates.length; i++) {
        const dist = calculateDistance(
          coordinates[i-1].latitude, coordinates[i-1].longitude,
          coordinates[i].latitude, coordinates[i].longitude
        );
        totalDistance += dist;
      }
    }
    
    const averageSpeed = totalDistance / (duration / 3600000);
    
    // Generate summary
    const summary = {
      basicSummary: {
        duration: `${durationHours}h ${durationMinutes}m`,
        distance: `${(totalDistance / 1000).toFixed(2)} km`,
        averageSpeed: `${averageSpeed.toFixed(1)} km/h`,
        startTime: new Date(tripStart).toLocaleString(),
        endTime: new Date(tripEnd).toLocaleString()
      },
      analytics: {
        totalDistance,
        duration,
        averageSpeed,
        maxSpeed: calculateMaxSpeed(coordinates),
        efficiency: motorData ? totalDistance / (motorData.fuelEfficiency || 1) : 0
      },
      maintenance: {
        alerts: generateMaintenanceAlerts(totalDistance, averageSpeed, motorData),
        recommendations: generateMaintenanceRecommendations(totalDistance, motorData)
      },
      recommendations: generateTripRecommendations(totalDistance, averageSpeed, 0)
    };
    
    res.json({
      summary: summary.basicSummary,
      analytics: summary.analytics,
      maintenance: summary.maintenance,
      recommendations: summary.recommendations,
      performance: {
        processingTime: Date.now() - startTime,
        coordinatesProcessed: coordinates ? coordinates.length : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Manage trip cache
 * POST /api/trip/cache-management
 */
const manageTripCache = async (req, res) => {
  try {
    const startTime = Date.now();
    const { action, tripData, userId, options = {} } = req.body;
    
    if (!action || !userId) {
      return res.status(400).json({ error: 'Action and user ID are required' });
    }
    
    let result;
    
    switch (action) {
      case 'save':
        result = await saveTripData(tripData, userId, options);
        break;
      case 'recover':
        result = await recoverTripData(userId, options);
        break;
      case 'complete':
        result = await completeTripData(tripData, userId, options);
        break;
      case 'clear':
        result = await clearTripData(userId, options);
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    res.json({
      success: result.success,
      tripData: result.tripData,
      cacheInfo: result.cacheInfo,
      performance: {
        action,
        processingTime: Date.now() - startTime,
        dataSize: JSON.stringify(result.tripData).length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper functions
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateMaxSpeed = (coordinates) => {
  if (!coordinates || coordinates.length < 2) return 0;
  
  let maxSpeed = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const dist = calculateDistance(
      coordinates[i-1].latitude, coordinates[i-1].longitude,
      coordinates[i].latitude, coordinates[i].longitude
    );
    const timeDiff = (coordinates[i].timestamp - coordinates[i-1].timestamp) / 1000; // seconds
    if (timeDiff > 0) {
      const speed = (dist / timeDiff) * 3.6; // km/h
      maxSpeed = Math.max(maxSpeed, speed);
    }
  }
  return maxSpeed;
};

const generateTripRecommendations = (distance, speed, fuelConsumed) => {
  const recommendations = [];
  
  if (distance > 100000) { // 100km
    recommendations.push('Long trip completed - consider taking a break');
  }
  
  if (speed > 120) {
    recommendations.push('High speed detected - drive safely');
  }
  
  if (fuelConsumed > 10) {
    recommendations.push('High fuel consumption - check vehicle efficiency');
  }
  
  return recommendations;
};

const generateMaintenanceAlerts = (distance, speed, motorData) => {
  const alerts = [];
  
  if (distance > 1000) {
    alerts.push('Trip distance exceeds 1000km - schedule maintenance check');
  }
  
  if (speed > 150) {
    alerts.push('Very high speed detected - check brake system');
  }
  
  return alerts;
};

const generateMaintenanceRecommendations = (distance, motorData) => {
  const recommendations = [];
  
  if (distance > 500) {
    recommendations.push('Check tire pressure and condition');
  }
  
  if (distance > 1000) {
    recommendations.push('Schedule oil change if due');
  }
  
  return recommendations;
};

// Cache management functions (simplified)
const saveTripData = async (tripData, userId, options) => {
  // In a real implementation, save to cache/database
  return {
    success: true,
    tripData,
    cacheInfo: { saved: true, timestamp: new Date() }
  };
};

const recoverTripData = async (userId, options) => {
  // In a real implementation, retrieve from cache/database
  return {
    success: true,
    tripData: null,
    cacheInfo: { recovered: false, timestamp: new Date() }
  };
};

const completeTripData = async (tripData, userId, options) => {
  // In a real implementation, mark trip as complete
  return {
    success: true,
    tripData: { ...tripData, completed: true },
    cacheInfo: { completed: true, timestamp: new Date() }
  };
};

const clearTripData = async (userId, options) => {
  // In a real implementation, clear cache
  return {
    success: true,
    tripData: null,
    cacheInfo: { cleared: true, timestamp: new Date() }
  };
};

module.exports = {
  calculateTripStatistics,
  generateTripSummary,
  manageTripCache
};