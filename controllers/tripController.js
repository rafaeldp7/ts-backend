const Trip = require("../models/TripModel");
const moment = require("moment");
const UserMotor = require("../models/userMotorModel");
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
// exports.addTrip = async (req, res) => {
//   try {
//     const {
//       userId,
//       motorId,
//       distance,
//       fuelUsedMin,
//       fuelUsedMax,
//       timeArrived,
//       eta,
//       startLocation,
//       destination,

//       // 🔽 NEW FIELDS
//       actualDistance,
//       actualFuelUsedMin,
//       actualFuelUsedMax,
//       kmph,
//       rerouteCount,
//       wasInBackground,
//       showAnalyticsModal,
//       analyticsNotes,
//       trafficCondition = "moderate",
//     } = req.body;

//     const newTrip = new Trip({
//       userId,
//       motorId,
//       distance,
//       fuelUsedMin,
//       fuelUsedMax,
//       timeArrived,
//       eta,
//       startLocation,
//       destination,

//       actualDistance,
//       actualFuelUsedMin,
//       actualFuelUsedMax,
//       kmph,
//       rerouteCount,
//       wasInBackground,
//       showAnalyticsModal,
//       analyticsNotes,
//       trafficCondition,
//     });

//     await newTrip.save();

//     // ✅ Update UserMotor.analytics
//     const traveledDistance = actualDistance || distance;
//     const fuelUsed = actualFuelUsedMax || fuelUsedMax || 0;

//     await UserMotor.findByIdAndUpdate(motorId, {
//       $inc: {
//         "analytics.totalDistance": traveledDistance,
//         "analytics.totalFuelUsed": fuelUsed,
//         "analytics.tripsCompleted": 1,
//       },
//     });

//     res.status(201).json({ msg: "Trip recorded", trip: newTrip });
//   } catch (err) {
//     res.status(500).json({ msg: "Failed to add trip", error: err.message });
//   }
// };
// 🟢 Create a new trip
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
/** exports.getPaginatedTrips = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

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
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Trip.countDocuments();

    res.status(200).json({
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      trips
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch paginated trips", error: err.message });
  }
};
**/
exports.getPaginatedTrips = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Default query (all trips)
    let query = {};

    if (search) {
      query = {
        $or: [
          { _id: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
          { destination: { $regex: search, $options: "i" } },
          { "motorId.nickname": { $regex: search, $options: "i" } },
          { "motorId.motorcycleId.model": { $regex: search, $options: "i" } },
          { "userId.name": { $regex: search, $options: "i" } },
          { "userId.email": { $regex: search, $options: "i" } },
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
      .sort({ createdAt: -1 });  // ✅ missing part

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


// controller
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
