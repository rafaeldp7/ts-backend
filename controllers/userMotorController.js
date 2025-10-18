// controllers/userMotorController.js
const UserMotor = require("../models/userMotorModel");
const FuelLog = require("../models/FuelLogModel");
const Trip = require("../models/TripModel");

// GET all user-motor links (with full user and motor details)
exports.getAllUserMotors = async (req, res) => {
  try {
    const userMotors = await UserMotor.find()
      .populate("motorcycleId")
      .populate("userId");

    res.status(200).json(userMotors);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch user motors", error: error.message });
  }
};


// GET all motors for a specific user (formatted)
// exports.getUserMotorsByUserId = async (req, res) => {
//   try {
//     const motors = await UserMotor.find({ userId: req.params.id }).populate("motorcycleId");

//     const formatted = motors.map((motor) => ({
//       _id: motor._id,
//       userId: motor.userId,
//       motorcycleId: motor.motorcycleId?._id || null,
//       nickname: motor.nickname || "",
//       name: motor.motorcycleId?.model || "Unknown Model",
//       fuelEfficiency: motor.motorcycleId?.fuelConsumption || 0,
//       engineDisplacement: motor.motorcycleId?.engineDisplacement || null,
//       plateNumber: motor.plateNumber || "",
//       registrationDate: motor.registrationDate || "",
//       dateAcquired: motor.dateAcquired || "",
//       odometerAtAcquisition: motor.odometerAtAcquisition || 0,
//       currentOdometer: motor.currentOdometer || 0,
//       age: motor.age || 0,
//       currentFuelLevel: motor.currentFuelLevel || 0,
//       fuelConsumptionStats: {
//         average: motor.fuelConsumptionStats?.average || 0,
//         max: motor.fuelConsumptionStats?.max || 0,
//         min: motor.fuelConsumptionStats?.min || 0,
//       },
//       analytics: {
//         totalDistance: motor.analytics?.totalDistance || 0,
//         tripsCompleted: motor.analytics?.tripsCompleted || 0,
//         totalFuelUsed: motor.analytics?.totalFuelUsed || 0,
//         maintenanceAlerts: motor.analytics?.maintenanceAlerts || [],
//       },

//       // 🚦 Add Virtual Fields here
//       totalDrivableDistance: motor.totalDrivableDistance ?? 0,
//       totalDrivableDistanceWithCurrentGas: motor.totalDrivableDistanceWithCurrentGas ?? 0,
//       isLowFuel: motor.isLowFuel ?? false,

//       createdAt: motor.createdAt,
//       updatedAt: motor.updatedAt,
//     }));

//     res.json(formatted);
//   } catch (err) {
//     console.error("Failed to get user motors:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
exports.getUserMotorsByUserId = async (req, res) => {
  try {
    const motors = await UserMotor.find({ userId: req.params.id })
      .populate("motorcycleId");

    const formatted = motors.map((motor) => ({
      _id: motor._id,
      userId: motor.userId,

      // ✅ backward compatible field
      motorcycleId: motor.motorcycleId?._id || null,

      // ✅ summary fields
      nickname: motor.nickname || "",
      name: motor.motorcycleId?.model || "Unknown Model",
      fuelEfficiency: motor.motorcycleId?.fuelConsumption || 0,
      engineDisplacement: motor.motorcycleId?.engineDisplacement || null,
      plateNumber: motor.plateNumber || "",
      registrationDate: motor.registrationDate || "",
      dateAcquired: motor.dateAcquired || "",
      odometerAtAcquisition: motor.odometerAtAcquisition || 0,
      currentOdometer: motor.currentOdometer || 0,
      age: motor.age || 0,
      currentFuelLevel: motor.currentFuelLevel || 0,

      fuelConsumptionStats: {
        average: motor.fuelConsumptionStats?.average || 0,
        max: motor.fuelConsumptionStats?.max || 0,
        min: motor.fuelConsumptionStats?.min || 0,
      },

      analytics: {
        totalDistance: motor.analytics?.totalDistance || 0,
        tripsCompleted: motor.analytics?.tripsCompleted || 0,
        totalFuelUsed: motor.analytics?.totalFuelUsed || 0,
        maintenanceAlerts: motor.analytics?.maintenanceAlerts || [],
      },

      // 🚦 virtuals
      totalDrivableDistance: motor.totalDrivableDistance ?? 0,
      totalDrivableDistanceWithCurrentGas: motor.totalDrivableDistanceWithCurrentGas ?? 0,
      isLowFuel: motor.isLowFuel ?? false,
      fuelTank: motor.fuelTank ?? 0,
      createdAt: motor.createdAt,
      updatedAt: motor.updatedAt,

      // ✅ full object included here
      motorcycleData: motor.motorcycleId || null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Failed to get user motors:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// PUT update only the fuel level + derived fields
exports.updateFuelLevel = async (req, res) => {
  try {
    const { id } = req.params; // motorId
    const { currentFuelLevel } = req.body;

    if (typeof currentFuelLevel !== "number") {
      return res.status(400).json({ msg: "currentFuelLevel must be a number" });
    }

    // Find motor and its motorcycle info (for fuel efficiency)
    const motor = await UserMotor.findById(id).populate("motorcycleId");
    if (!motor) return res.status(404).json({ msg: "Motor not found" });

    const fuelEfficiency = motor.motorcycleId?.fuelConsumption || 0; // km/L
    const tankCapacity = motor.motorcycleId?.fuelTankCapacity || 0;  // optional, if you store it

    // Calculate derived values
    const totalDrivableDistance = tankCapacity && fuelEfficiency 
      ? tankCapacity * fuelEfficiency 
      : 0;

    const totalDrivableDistanceWithCurrentGas = fuelEfficiency
      ? currentFuelLevel * fuelEfficiency
      : 0;

    const isLowFuel = totalDrivableDistanceWithCurrentGas < 50; // 🚨 you can change threshold

    // Update motor
    motor.currentFuelLevel = currentFuelLevel;
    motor.totalDrivableDistance = totalDrivableDistance;
    motor.totalDrivableDistanceWithCurrentGas = totalDrivableDistanceWithCurrentGas;
    motor.isLowFuel = isLowFuel;

    const updatedMotor = await motor.save();

    res.status(200).json({
      msg: "Fuel level updated successfully (backend)",
      motor: {
        _id: updatedMotor._id,
        nickname: updatedMotor.nickname,
        currentFuelLevel: updatedMotor.currentFuelLevel,
        totalDrivableDistance: updatedMotor.totalDrivableDistance,
        totalDrivableDistanceWithCurrentGas: updatedMotor.totalDrivableDistanceWithCurrentGas,
        isLowFuel: updatedMotor.isLowFuel,
      }
    });
  } catch (err) {
    console.error("❌ Failed to update fuel level:", err);
    res.status(500).json({ msg: "Failed to update fuel level in backend", error: err.message });
  }
};

// PUT update fuel efficiency records and current efficiency
exports.updateEfficiency = async (req, res) => {
  const motorId = req.params.id;
  const { fuelEfficiencyRecords, currentFuelEfficiency } = req.body;

  if (!fuelEfficiencyRecords || typeof currentFuelEfficiency !== 'number') {
    return res.status(400).json({
      message: 'Missing or invalid efficiency data.',
    });
  }

  try {
    const updatedMotor = await UserMotor.findByIdAndUpdate(
      motorId,
      {
        $set: {
          fuelEfficiencyRecords,
          currentFuelEfficiency,
        },
      },
      { new: true }
    );

    if (!updatedMotor) {
      return res.status(404).json({ message: 'Motor not found.' });
    }

    res.status(200).json({
      message: 'Fuel efficiency updated successfully.',
      data: updatedMotor,
    });
  } catch (error) {
    console.error('Error updating efficiency:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};





exports.recalculateAllMotorAnalytics = async (req, res) => {
  try {
    const motors = await UserMotor.find();

    for (const motor of motors) {
      const trips = await Trip.find({ motorId: motor._id });

      let totalDistance = 0;
      let totalFuelUsed = 0;
      let tripsCompleted = trips.length;

      trips.forEach((trip) => {
        const traveled = trip.actualDistance || trip.distance || 0;
        const fuel = trip.actualFuelUsedMax || trip.fuelUsedMax || 0;

        totalDistance += traveled;
        totalFuelUsed += fuel;
      });

      await UserMotor.findByIdAndUpdate(motor._id, {
        analytics: {
          totalDistance,
          totalFuelUsed,
          tripsCompleted,
        },
      });
    }

    res.status(200).json({
      msg: "✅ Motor analytics successfully recalculated.",
      updatedMotors: motors.length,
    });
  } catch (error) {
    console.error("❌ Recalculation failed:", error);
    res.status(500).json({
      msg: "❌ Failed to recalculate motor analytics",
      error: error.message,
    });
  }
};



// POST a new user motor
exports.createUserMotor = async (req, res) => {
  try {
    const { userId, motorcycleId, nickname,  registrationDate } = req.body;

    if (!userId || !motorcycleId) {
      return res.status(400).json({ msg: "userId and motorcycleId are required." });
    }

    const newUserMotor = new UserMotor({
      userId,
      motorcycleId,
      nickname,

      registrationDate,
    });

    await newUserMotor.save();

    res.status(201).json({
      msg: "User motor added successfully",
      userMotor: newUserMotor,
    });
  } catch (error) {
    res.status(400).json({ msg: "Failed to add user motor", error: error.message });
  }
};

// PUT update a user motor (dynamic)
exports.updateUserMotor = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the motor first
    const motor = await UserMotor.findById(id).populate("motorcycleId");
    if (!motor) {
      return res.status(404).json({ msg: "Motor entry not found" });
    }

    // Whitelisted fields
    const allowedFields = [
      "nickname",
      "motorcycleId",
      "currentFuelLevel",
      "fuelConsumptionStats",
      "analytics",
      "plateNumber",
      "registrationDate",
      "dateAcquired",
      "odometerAtAcquisition",
      "currentOdometer",
      "age",
      "totalDrivableDistance",
      "totalDrivableDistanceWithCurrentGas",
      "isLowFuel",
    ];

    // Apply updates
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Merge nested objects
        if (typeof req.body[field] === "object" && req.body[field] !== null && motor[field]) {
          motor[field] = { ...motor[field].toObject(), ...req.body[field] };
        } else {
          motor[field] = req.body[field];
        }
      }
    });

    // Save the motor
    const updatedMotor = await motor.save();

    // Format like getUserMotorsByUserId
    const formatted = {
      _id: updatedMotor._id,
      nickname: updatedMotor.nickname,
      name: updatedMotor.motorcycleId?.model || "Unknown Model",
      fuelEfficiency: updatedMotor.motorcycleId?.fuelConsumption || 0,
      engineDisplacement: updatedMotor.motorcycleId?.engineDisplacement || null,
      analytics: {
        totalDistance: updatedMotor.analytics?.totalDistance || 0,
        tripsCompleted: updatedMotor.analytics?.tripsCompleted || 0,
        totalFuelUsed: updatedMotor.analytics?.totalFuelUsed || 0,
        maintenanceAlerts: updatedMotor.analytics?.maintenanceAlerts || [],
      },
    };

    res.status(200).json({ msg: "User motor updated", updated: formatted });
  } catch (error) {
    console.error("Failed to update motor:", error);
    res.status(400).json({ msg: "Failed to update", error: error.message });
  }
};



// DELETE a user motor
exports.deleteUserMotor = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await UserMotor.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ msg: "Motor entry not found" });
    }

    res.status(200).json({ msg: "User motor deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to delete", error: error.message });
  }
};

// GET total user motor count
exports.getUserMotorCount = async (req, res) => {
  try {
    const count = await UserMotor.countDocuments();
    res.status(200).json({ totalUserMotors: count });
  } catch (err) {
    res.status(500).json({ msg: "Failed to count user motors", error: err.message });
  }
};

// POST log oil change date
exports.logOilChange = async (req, res) => {
  try {
    await UserMotor.findByIdAndUpdate(req.params.id, {
      $push: { changeOilHistory: { date: new Date() } },
    });
    res.status(200).json({ msg: "Oil change logged successfully." });
  } catch (err) {
    res.status(500).json({ msg: "Failed to log oil change", error: err.message });
  }
};

// POST log tune-up date
exports.logTuneUp = async (req, res) => {
  try {
    await UserMotor.findByIdAndUpdate(req.params.id, {
      $push: { tuneUpHistory: { date: new Date() } },
    });
    res.status(200).json({ msg: "Tune-up logged successfully." });
  } catch (err) {
    res.status(500).json({ msg: "Failed to log tune-up", error: err.message });
  }
};

// Recalculate fuel consumption stats when logs are updated
exports.recalculateFuelStats = async (motorId) => {
  const logs = await FuelLog.find({ motorId });
  if (logs.length === 0) return;

  const allLiters = logs.map(log => log.liters);
  const average = allLiters.reduce((a, b) => a + b, 0) / allLiters.length;
  const max = Math.max(...allLiters);
  const min = Math.min(...allLiters);

  await UserMotor.findByIdAndUpdate(motorId, {
    "fuelConsumptionStats.average": average,
    "fuelConsumptionStats.max": max,
    "fuelConsumptionStats.min": min,
  });
};

exports.getUserOverviewAnalytics = async (req, res) => {
  try {
    const motors = await UserMotor.find({ userId: req.params.userId });

    let totalTrips = 0;
    let totalDistance = 0;
    let totalFuelUsed = 0;

    motors.forEach(motor => {
      totalTrips += motor.analytics?.tripsCompleted || 0;
      totalDistance += motor.analytics?.totalDistance || 0;
      totalFuelUsed += motor.analytics?.totalFuelUsed || 0;
    });

    res.status(200).json({
      totalMotors: motors.length,
      totalTrips,
      totalDistance,
      totalFuelUsed,
      avgFuelPerKm: totalDistance > 0 ? (totalFuelUsed / totalDistance).toFixed(2) : 0,
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to compute user overview", error: err.message });
  }
};
exports.getMotorOverviewAnalytics = async (req, res) => {
  try {
    const motor = await UserMotor.findById(req.params.motorId);

    if (!motor) return res.status(404).json({ msg: "Motor not found" });

    const analytics = motor.analytics || {};
    const fuelStats = motor.fuelConsumptionStats || {};

    res.status(200).json({
      motorId: motor._id,
      nickname: motor.nickname,

      totalTrips: analytics.tripsCompleted || 0,
      totalDistance: analytics.totalDistance || 0,
      totalFuelUsed: analytics.totalFuelUsed || 0,
      fuelEfficiency: analytics.totalDistance > 0
        ? (analytics.totalFuelUsed / analytics.totalDistance).toFixed(2)
        : null,
      alerts: analytics.maintenanceAlerts || [],
      fuelStats: {
        average: fuelStats.average || 0,
        max: fuelStats.max || 0,
        min: fuelStats.min || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch motor analytics", error: err.message });
  }
};