const mongoose = require('mongoose');

/**
 * Process background location updates
 * POST /api/location/process-background
 */
const processBackgroundLocation = async (req, res) => {
  try {
    const startTime = Date.now();
    const { locations, tripId, motorData } = req.body;
    
    if (!locations || !Array.isArray(locations)) {
      return res.status(400).json({ error: 'Locations array is required' });
    }
    
    // Process location data
    const processedLocations = await processLocationData({
      locations,
      tripId,
      motorData
    });
    
    // Calculate distances
    const distanceData = await calculateDistances(processedLocations);
    
    // Track fuel consumption
    const fuelData = await trackFuelConsumption(distanceData, motorData);
    
    // Snap to roads
    const snappedRoute = await snapLocationsToRoads(processedLocations);
    
    res.json({
      processedLocations,
      distanceData,
      fuelData,
      snappedRoute,
      statistics: await calculateTripStatistics(processedLocations),
      performance: {
        processingTime: Date.now() - startTime,
        calculationsPerformed: processedLocations.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Snap coordinates to roads
 * POST /api/location/snap-roads
 */
const snapToRoads = async (req, res) => {
  try {
    const startTime = Date.now();
    const { coordinates, interpolate = true } = req.body;
    
    if (!coordinates || !Array.isArray(coordinates)) {
      return res.status(400).json({ error: 'Coordinates array is required' });
    }
    
    // In a real implementation, call Google Roads API
    const snappedPoints = coordinates.map((coord, index) => ({
      latitude: coord.latitude,
      longitude: coord.longitude,
      originalIndex: index,
      placeId: `place_${index}`
    }));
    
    res.json({
      snappedPoints,
      snappedCoordinates: snappedPoints.map(p => ({ latitude: p.latitude, longitude: p.longitude })),
      hasSnapped: true,
      processingTime: Date.now() - startTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper functions
const processLocationData = async ({ locations, tripId, motorData }) => {
  return locations.map(location => ({
    ...location,
    processed: true,
    tripId,
    timestamp: new Date(location.timestamp || Date.now())
  }));
};

const calculateDistances = async (locations) => {
  const distances = [];
  
  for (let i = 1; i < locations.length; i++) {
    const distance = calculateDistance(
      locations[i-1].latitude, locations[i-1].longitude,
      locations[i].latitude, locations[i].longitude
    );
    distances.push({
      from: i-1,
      to: i,
      distance,
      timestamp: locations[i].timestamp
    });
  }
  
  return {
    distances,
    totalDistance: distances.reduce((sum, d) => sum + d.distance, 0)
  };
};

const trackFuelConsumption = async (distanceData, motorData) => {
  if (!motorData || !motorData.fuelEfficiency) {
    return { fuelConsumed: 0, newFuelLevel: 0 };
  }
  
  const totalDistance = distanceData.totalDistance;
  const fuelConsumed = totalDistance / motorData.fuelEfficiency;
  const fuelConsumedPercentage = (fuelConsumed / motorData.fuelTank) * 100;
  const newFuelLevel = Math.max(0, motorData.currentFuelLevel - fuelConsumedPercentage);
  
  return {
    fuelConsumed,
    fuelConsumedPercentage,
    newFuelLevel,
    remainingDistance: newFuelLevel * motorData.fuelEfficiency
  };
};

const snapLocationsToRoads = async (locations) => {
  // In real implementation, call Google Roads API
  return {
    snappedPoints: locations,
    hasSnapped: true
  };
};

const calculateTripStatistics = async (locations) => {
  if (locations.length < 2) {
    return { totalDistance: 0, averageSpeed: 0 };
  }
  
  let totalDistance = 0;
  let totalTime = 0;
  
  for (let i = 1; i < locations.length; i++) {
    const distance = calculateDistance(
      locations[i-1].latitude, locations[i-1].longitude,
      locations[i].latitude, locations[i].longitude
    );
    totalDistance += distance;
    
    const timeDiff = new Date(locations[i].timestamp) - new Date(locations[i-1].timestamp);
    totalTime += timeDiff;
  }
  
  const averageSpeed = totalTime > 0 ? (totalDistance / (totalTime / 3600000)) : 0;
  
  return {
    totalDistance,
    averageSpeed,
    duration: totalTime,
    pointsProcessed: locations.length
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
  processBackgroundLocation,
  snapToRoads
};
