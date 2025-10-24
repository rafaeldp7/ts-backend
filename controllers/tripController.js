const Trip = require("../models/TripModel");
const moment = require("moment");
const UserMotor = require("../models/userMotorModel");
const mongoose = require('mongoose');

/**
 * ================= USER SIDE =================
 */

// ✅ Get all trips made by a specific user
exports.getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.params.userId })
      .populate("userId", "name email")
      .populate({
        path: "motorId",
        populate: {
          path: "motorcycleId",
          model: "Motorcycle",
          select: "model engineDisplacement"
        },
        select: "nickname"
      })
      .sort({ createdAt: -1 });

    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch user trips", error: err.message });
  }
};

// ✅ Record a new trip from user side
exports.addTrip = async (req, res) => {
  try {
    const tripData = req.body;
    const newTrip = new Trip(tripData);
    const savedTrip = await newTrip.save();
    res.status(201).json({ success: true, trip: savedTrip });
  } catch (error) {
    console.error("❌ Error creating trip:", error);
    res.status(500).json({ success: false, message: "Failed to create trip" });
  }
};

exports.updateTrip = async (req, res) => {
  try {
    const oldTrip = await Trip.findById(req.params.id);
    if (!oldTrip) return res.status(404).json({ msg: "Trip not found" });

    const oldDistance = oldTrip.actualDistance || oldTrip.distance;
    const oldFuel = oldTrip.actualFuelUsedMax || oldTrip.fuelUsedMax || 0;

    const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    const newDistance = updatedTrip.actualDistance || updatedTrip.distance;
    const newFuel = updatedTrip.actualFuelUsedMax || updatedTrip.fuelUsedMax || 0;

    const distanceDiff = newDistance - oldDistance;
    const fuelDiff = newFuel - oldFuel;

    await UserMotor.findByIdAndUpdate(updatedTrip.motorId, {
      $inc: {
        "analytics.totalDistance": distanceDiff,
        "analytics.totalFuelUsed": fuelDiff,
      },
    });

    res.status(200).json(updatedTrip);
  } catch (err) {
    res.status(500).json({ msg: "Failed to update trip", error: err.message });
  }
};

/**
 * ================= ADMIN SIDE =================
 */

// ✅ Get all trips from all users
exports.getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("userId", "name email")
      .populate({
        path: "motorId",
        populate: {
          path: "motorcycleId",
          model: "Motorcycle",
          select: "model engineDisplacement"
        },
        select: "nickname"
      })
      .sort({ createdAt: -1 });

    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch all trips", error: err.message });
  }
};

// ✅ Delete a trip by ID
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ msg: "Trip not found" });

    const traveledDistance = trip.actualDistance || trip.distance;
    const fuelUsed = trip.actualFuelUsedMax || trip.fuelUsedMax || 0;

    // ✅ Reverse UserMotor.analytics
    await UserMotor.findByIdAndUpdate(trip.motorId, {
      $inc: {
        "analytics.totalDistance": -traveledDistance,
        "analytics.totalFuelUsed": -fuelUsed,
        "analytics.tripsCompleted": -1,
      },
    });

    await trip.deleteOne();

    res.status(200).json({ msg: "Trip deleted successfully and motor stats updated." });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete trip", error: err.message });
  }
};

// ✅ Admin view: Get trips by specific user
exports.getTripsByUser = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.params.userId })
      .populate("userId", "name email")
      .populate({
        path: "motorId",
        populate: {
          path: "motorcycleId",
          model: "Motorcycle",
          select: "model engineDisplacement"
        },
        select: "nickname"
      })
      .sort({ createdAt: -1 });

    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch trips for user", error: err.message });
  }
};

// ✅ Filter trips by date range
exports.getTripsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const trips = await Trip.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    })
      .populate("userId", "name email")
      .populate({
        path: "motorId",
        populate: {
          path: "motorcycleId",
          model: "Motorcycle",
          select: "model engineDisplacement"
        },
        select: "nickname"
      });

    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ msg: "Failed to filter trips by date", error: err.message });
  }
};

// ✅ Paginate all trips
exports.getPaginatedTrips = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Default query (all trips)
    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $or: [
          { status: searchRegex },
          { destination: searchRegex },
          { startLocation: searchRegex },
        ],
      };
    }

    const trips = await Trip.find(query)
      .populate("userId", "name email")
      .populate({
        path: "motorId",
        populate: {
          path: "motorcycleId",
          model: "Motorcycle",
          select: "model engineDisplacement",
        },
        select: "nickname",
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Trip.countDocuments(query);

    res.status(200).json({
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      trips,
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch paginated trips", error: err.message });
  }
};

/**
 * ================= ANALYTICS =================
 */

// ✅ Get total distance, fuel, time, and cost across all trips
exports.getTripAnalytics = async (req, res) => {
  try {
    const trips = await Trip.find();

    const totalDistance = trips.reduce((sum, t) => sum + parseFloat(t.distance || 0), 0);
    const totalFuel = trips.reduce((sum, t) => {
      const avg = ((t.fuelUsedMin || 0) + (t.fuelUsedMax || 0)) / 2;
      return sum + avg;
    }, 0);
    const totalTime = trips.reduce((sum, t) => sum + parseFloat(t.duration || 0), 0);

    res.status(200).json({
      totalTrips: trips.length,
      totalDistance,
      totalTime,
      totalFuel,
      totalExpense: totalFuel * 100 // Assume 100 PHP per liter
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to compute analytics", error: err.message });
  }
};

// ✅ Monthly summary: total distance, fuel, time, expense
exports.getMonthlyTripSummary = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const trips = await Trip.find({ createdAt: { $gte: start, $lte: end } });

    const monthlyDistance = trips.reduce((sum, t) => sum + parseFloat(t.distance || 0), 0);
    const monthlyFuel = trips.reduce((sum, t) => {
      const avg = ((t.fuelUsedMin || 0) + (t.fuelUsedMax || 0)) / 2;
      return sum + avg;
    }, 0);
    const monthlyTime = trips.reduce((sum, t) => sum + parseFloat(t.duration || 0), 0);

    res.status(200).json({
      tripsThisMonth: trips.length,
      monthlyDistance,
      monthlyFuel,
      monthlyTime,
      monthlyExpense: monthlyFuel * 100
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch monthly summary", error: err.message });
  }
};

/**
 * ================= INSIGHTS =================
 */

// ✅ Top 5 users based on trip count
exports.getTopUsersByTripCount = async (req, res) => {
  try {
    const results = await Trip.aggregate([
      { $group: { _id: "$userId", tripCount: { $sum: 1 } } },
      { $sort: { tripCount: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ msg: "Failed to compute top users", error: err.message });
  }
};

// ✅ Top 5 most used motorcycles
exports.getMostUsedMotors = async (req, res) => {
  try {
    const results = await Trip.aggregate([
      { $group: { _id: "$motorId", usageCount: { $sum: 1 } } },
      { $sort: { usageCount: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch top motors", error: err.message });
  }
};

// ✅ Get in-progress trip for a user
exports.getInProgressTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      userId: req.params.userId,
      status: "in-progress",
    }).sort({ createdAt: -1 });

    if (!trip) return res.status(200).json(null); // no ongoing trip
    res.status(200).json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update trip status (e.g., from in-progress ➝ completed)
exports.updateTripStatus = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { status } = req.body;

    if (!["planned", "in-progress", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status value." });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      { status },
      { new: true }
    );

    if (!updatedTrip) {
      return res.status(404).json({ msg: "Trip not found." });
    }

    res.status(200).json({ msg: "Trip status updated", trip: updatedTrip });
  } catch (err) {
    res.status(500).json({ msg: "Failed to update trip status", error: err.message });
  }
};

// ✅ Complete trip and update motor analytics
exports.completeTripAndUpdateMotor = async (req, res) => {
  try {
    const tripId = req.params.id;
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ msg: "Trip not found." });

    // Update Trip Status
    trip.status = "completed";
    await trip.save();

    // Update related UserMotor predictive fields
    const motor = await UserMotor.findById(trip.motorId);
    if (!motor) return res.status(404).json({ msg: "UserMotor not found." });

    const distance = trip.actualDistance || trip.distance || 0;
    const fuelUsed = trip.actualFuelUsedMax || trip.fuelUsedMax || 0;

    // Update analytics fields
    motor.analytics.tripsCompleted += 1;
    motor.analytics.totalDistance += distance;
    motor.analytics.totalFuelUsed += fuelUsed;

    // Update predictive mileage fields
    motor.distanceSinceOilChange = (motor.distanceSinceOilChange || 0) + distance;
    motor.distanceSinceTuneUp = (motor.distanceSinceTuneUp || 0) + distance;

    await motor.save();

    res.status(200).json({ msg: "Trip completed and motor updated." });
  } catch (err) {
    console.error("Error completing trip:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// ✅ Predictive Summary API
exports.getPredictiveSummary = async (req, res) => {
  try {
    const motor = await UserMotor.findById(req.params.motorId).populate("motorcycleId");
    if (!motor) return res.status(404).json({ msg: "Motor not found." });

    const oilChangeLimit = 2000;
    const tuneUpLimit = 5000;
    const ageLimit = 3; // in years

    const now = new Date();
    const registered = motor.registrationDate || now;
    const ageYears = Math.floor((now - registered) / (1000 * 60 * 60 * 24 * 365));

    res.json({
      motorId: motor._id,
      nickname: motor.nickname,
      fuelType: motor.motorcycleId?.fuelType || "N/A",
      age: ageYears,
      distanceSinceOilChange: motor.distanceSinceOilChange || 0,
      distanceSinceTuneUp: motor.distanceSinceTuneUp || 0,
      oilChangeDue: (motor.distanceSinceOilChange || 0) >= oilChangeLimit,
      tuneUpDue: (motor.distanceSinceTuneUp || 0) >= tuneUpLimit,
      ageStatus: ageYears >= ageLimit ? "Consider replacing" : "Good condition",
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch predictive summary", error: err.message });
  }
};

// ✅ Reset predictive data for motor
exports.resetPredictiveCounters = async (req, res) => {
  try {
    const { motorId } = req.params;
    const { resetType } = req.body; // e.g., "oil", "tuneUp", or "both"

    const motor = await UserMotor.findById(motorId);
    if (!motor) return res.status(404).json({ msg: "Motor not found." });

    if (resetType === "oil" || resetType === "both") {
      motor.distanceSinceOilChange = 0;
    }
    if (resetType === "tuneUp" || resetType === "both") {
      motor.distanceSinceTuneUp = 0;
    }

    await motor.save();
    res.status(200).json({ msg: "Predictive counters reset successfully", motor });
  } catch (err) {
    res.status(500).json({ msg: "Failed to reset predictive counters", error: err.message });
  }
};

/**
 * ================= OPTIMIZATION METHODS (from previous implementation) =================
 */

// Helper function to calculate distance (if not already in calculationController)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculate trip statistics
 * POST /api/trip/calculate-statistics
 */
exports.calculateTripStatistics = async (req, res) => {
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
    if (totalDistance > 5000) { // Example: oil change every 5000km
      maintenanceAlerts.push('Consider an oil change soon!');
    }

    res.json({
      success: true,
      duration: duration,
      distance: totalDistance,
      fuelLevel: newFuelLevel,
      fuelConsumed: fuelConsumed,
      averageSpeed: averageSpeed,
      efficiency: fuelEfficiency,
      maintenanceAlerts: maintenanceAlerts,
      recommendations: [],
      processingTime: Date.now() - startTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generate comprehensive trip summary
 * POST /api/trip/summary-analysis
 */
exports.generateTripSummary = async (req, res) => {
  try {
    const startTime = Date.now();
    const { tripData, motorData, locationData, maintenanceData } = req.body;

    // Simulate comprehensive summary generation
    const basicSummary = {
      tripId: tripData._id || 'new-trip',
      startTime: tripData.tripStartTime,
      endTime: tripData.tripEndTime,
      totalDistance: tripData.distance || 0,
      totalDuration: tripData.duration || 0,
      startLocation: locationData.startAddress || 'Unknown',
      endLocation: locationData.endAddress || 'Unknown',
      motorcycle: motorData.nickname || 'Unknown Motor',
    };

    const analytics = {
      averageSpeed: tripData.averageSpeed || 0,
      fuelEfficiency: motorData.fuelEfficiency || 0,
      fuelConsumed: tripData.fuelConsumed || 0,
      costEstimate: (tripData.fuelConsumed || 0) * 1.5, // Example cost
    };

    const maintenance = {
      alerts: maintenanceData.alerts || [],
      recommendations: maintenanceData.recommendations || [],
    };

    res.json({
      success: true,
      summary: basicSummary,
      analytics,
      maintenance,
      recommendations: [],
      performance: {
        processingTime: Date.now() - startTime,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// In-memory cache for trip data (for demonstration)
const tripCache = new Map();

// Helper functions for trip cache management
const saveTripData = async (tripData, userId, options) => {
  const key = `trip:${userId}:${tripData._id || 'current'}`;
  tripCache.set(key, { data: tripData, timestamp: new Date(), ...options });
  return { success: true, tripData, cacheInfo: { saved: true } };
};

const recoverTripData = async (userId, options) => {
  const key = `trip:${userId}:current`; // Assuming 'current' is for ongoing trip
  const cached = tripCache.get(key);
  if (cached) {
    return { success: true, tripData: cached.data, cacheInfo: { recovered: true, timestamp: cached.timestamp } };
  }
  return { success: false, tripData: null, cacheInfo: { recovered: false } };
};

const completeTripData = async (tripData, userId, options) => {
  const key = `trip:${userId}:current`;
  tripCache.delete(key); // Clear from cache after completion
  // In a real app, save to DB here
  return { success: true, tripData, cacheInfo: { completed: true } };
};

const clearTripData = async (userId, options) => {
  const key = `trip:${userId}:current`;
  tripCache.delete(key);
  return { success: true, tripData: null, cacheInfo: { cleared: true, timestamp: new Date() } };
};

/**
 * Manage Trip Cache
 * POST /api/trip/cache-management
 */
exports.manageTripCache = async (req, res) => {
  try {
    const startTime = Date.now();
    const { action, tripData, userId, options } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ error: 'User ID and action are required' });
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
        return res.status(400).json({ error: 'Invalid cache management action' });
    }

    res.json({
      success: result.success,
      tripData: result.tripData,
      cacheInfo: result.cacheInfo,
      performance: {
        action: action,
        processingTime: Date.now() - startTime,
        dataSize: tripData ? JSON.stringify(tripData).length : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};