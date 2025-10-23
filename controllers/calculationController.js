const mongoose = require('mongoose');

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
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

/**
 * Calculate distance between multiple coordinate pairs
 * POST /api/calculations/distance
 */
const calculateDistance = async (req, res) => {
  try {
    const startTime = Date.now();
    const { coordinates } = req.body;
    
    if (!coordinates || !Array.isArray(coordinates)) {
      return res.status(400).json({ error: 'Coordinates array is required' });
    }
    
    const distances = coordinates.map(coord => {
      if (!coord.lat1 || !coord.lon1 || !coord.lat2 || !coord.lon2) {
        throw new Error('Invalid coordinate format');
      }
      return haversineDistance(coord.lat1, coord.lon1, coord.lat2, coord.lon2);
    });
    
    const totalDistance = distances.reduce((sum, dist) => sum + dist, 0);
    
    res.json({
      distances,
      totalDistance,
      processingTime: Date.now() - startTime,
      coordinatesProcessed: coordinates.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Calculate fuel consumption based on distance and motor efficiency
 * POST /api/calculations/fuel-consumption
 */
const calculateFuelConsumption = async (req, res) => {
  try {
    const startTime = Date.now();
    const { distance, motorData, options = {} } = req.body;
    
    if (!distance || !motorData) {
      return res.status(400).json({ error: 'Distance and motor data are required' });
    }
    
    const { fuelEfficiency, fuelTank, currentFuelLevel } = motorData;
    
    if (!fuelEfficiency || !fuelTank) {
      return res.status(400).json({ error: 'Motor fuel efficiency and tank capacity are required' });
    }
    
    // Calculate fuel consumption
    const fuelConsumed = distance / fuelEfficiency; // in liters
    const fuelConsumedPercentage = (fuelConsumed / fuelTank) * 100;
    const remainingFuel = Math.max(0, currentFuelLevel - fuelConsumedPercentage);
    const remainingDistance = remainingFuel * fuelEfficiency;
    
    res.json({
      fuelConsumed,
      fuelConsumedPercentage,
      remainingFuel,
      remainingDistance,
      canCompleteTrip: remainingFuel > 0,
      processingTime: Date.now() - startTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Calculate trip statistics and analytics
 * POST /api/calculations/trip-statistics
 */
const calculateTripStatistics = async (req, res) => {
  try {
    const startTime = Date.now();
    const { tripData, motorData, locationData } = req.body;
    
    if (!tripData || !motorData) {
      return res.status(400).json({ error: 'Trip data and motor data are required' });
    }
    
    const { startTime: tripStart, endTime: tripEnd, coordinates } = tripData;
    const { fuelEfficiency, fuelTank } = motorData;
    
    // Calculate duration
    const duration = new Date(tripEnd) - new Date(tripStart);
    const durationMinutes = Math.floor(duration / 60000);
    const durationHours = Math.floor(durationMinutes / 60);
    
    // Calculate total distance
    let totalDistance = 0;
    if (coordinates && coordinates.length > 1) {
      for (let i = 1; i < coordinates.length; i++) {
        const dist = haversineDistance(
          coordinates[i-1].latitude, coordinates[i-1].longitude,
          coordinates[i].latitude, coordinates[i].longitude
        );
        totalDistance += dist;
      }
    }
    
    // Calculate fuel consumption
    const fuelConsumed = totalDistance / fuelEfficiency;
    const averageSpeed = totalDistance / (duration / 3600000); // km/h
    
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
        efficiency: fuelEfficiency,
        tankCapacity: fuelTank
      },
      speed: {
        average: averageSpeed
      },
      processingTime: Date.now() - startTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  calculateDistance,
  calculateFuelConsumption,
  calculateTripStatistics
};
