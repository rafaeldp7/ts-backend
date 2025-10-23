const mongoose = require('mongoose');

/**
 * Process location update
 * POST /api/tracking/process-location
 */
const processLocationUpdate = async (req, res) => {
  try {
    const startTime = Date.now();
    const { location, motorData, tripData, options = {} } = req.body;
    
    if (!location) {
      return res.status(400).json({ error: 'Location data is required' });
    }
    
    // Process location update
    const processedLocation = await performLocationProcessing({
      location,
      motorData,
      tripData,
      options: {
        includeSnapping: true,
        includeFuelCalculation: true,
        includeStatistics: true,
        ...options
      }
    });
    
    res.json({
      processedLocation: processedLocation.location,
      snappedLocation: processedLocation.snappedLocation,
      statistics: processedLocation.statistics,
      fuelUpdate: processedLocation.fuelUpdate,
      performance: {
        processingTime: Date.now() - startTime,
        calculationsPerformed: processedLocation.calculationsPerformed
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper functions
const performLocationProcessing = async ({ location, motorData, tripData, options }) => {
  const processedLocation = {
    ...location,
    processed: true,
    timestamp: new Date(location.timestamp || Date.now()),
    accuracy: location.accuracy || 0
  };
  
  const snappedLocation = options.includeSnapping ? await snapLocation(location) : location;
  
  const statistics = options.includeStatistics ? await calculateLocationStatistics(location, tripData) : null;
  
  const fuelUpdate = options.includeFuelCalculation && motorData ? 
    await calculateFuelUpdate(location, motorData, tripData) : null;
  
  return {
    location: processedLocation,
    snappedLocation,
    statistics,
    fuelUpdate,
    calculationsPerformed: 3
  };
};

const snapLocation = async (location) => {
  // In real implementation, call Google Roads API
  return {
    ...location,
    snapped: true,
    roadSnapped: true
  };
};

const calculateLocationStatistics = async (location, tripData) => {
  if (!tripData || !tripData.startLocation) {
    return { distanceFromStart: 0, speed: 0 };
  }
  
  const distanceFromStart = calculateDistance(
    tripData.startLocation.latitude, tripData.startLocation.longitude,
    location.latitude, location.longitude
  );
  
  const speed = location.speed || 0;
  
  return {
    distanceFromStart,
    speed,
    altitude: location.altitude || 0,
    heading: location.heading || 0
  };
};

const calculateFuelUpdate = async (location, motorData, tripData) => {
  if (!motorData || !tripData) {
    return null;
  }
  
  const { fuelEfficiency, fuelTank, currentFuelLevel } = motorData;
  
  if (!fuelEfficiency) {
    return null;
  }
  
  // Calculate distance since last update
  const lastLocation = tripData.lastLocation;
  let distanceTraveled = 0;
  
  if (lastLocation) {
    distanceTraveled = calculateDistance(
      lastLocation.latitude, lastLocation.longitude,
      location.latitude, location.longitude
    );
  }
  
  // Calculate fuel consumption
  const fuelConsumed = distanceTraveled / fuelEfficiency;
  const fuelConsumedPercentage = (fuelConsumed / fuelTank) * 100;
  const newFuelLevel = Math.max(0, currentFuelLevel - fuelConsumedPercentage);
  
  return {
    fuelConsumed,
    fuelConsumedPercentage,
    newFuelLevel,
    remainingDistance: newFuelLevel * fuelEfficiency,
    distanceTraveled
  };
};

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

module.exports = {
  processLocationUpdate
};
