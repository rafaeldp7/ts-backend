// controllers/userMotorController.js
const UserMotor = require("../models/userMotorModel");
const FuelLog = require("../models/FuelLog");

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
exports.getUserMotorsByUserId = async (req, res) => {
  try {
    const motors = await UserMotor.find({ userId: req.params.id }).populate("motorcycleId");

    const formatted = motors.map((motor) => ({
      name: motor.motorcycleId.model,
      fuelEfficiency: motor.motorcycleId.fuelConsumption,
      plateNumber: motor.plateNumber,
      nickname: motor.nickname,
      _id: motor._id,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Failed to get user motors:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST a new user motor
exports.createUserMotor = async (req, res) => {
  try {
    const { userId, motorcycleId, nickname, plateNumber, registrationDate } = req.body;

    if (!userId || !motorcycleId) {
      return res.status(400).json({ msg: "userId and motorcycleId are required." });
    }

    const newUserMotor = new UserMotor({
      userId,
      motorcycleId,
      nickname,
      plateNumber,
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

// PUT update a user motor
exports.updateUserMotor = async (req, res) => {
  try {
    const { id } = req.params;
    const { motorcycleId, plateNumber, nickname, registrationDate } = req.body;

    const updated = await UserMotor.findByIdAndUpdate(
      id,
      { motorcycleId, plateNumber, nickname, registrationDate },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Motor entry not found" });
    }

    res.status(200).json({ msg: "User motor updated", updated });
  } catch (error) {
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
      plateNumber: motor.plateNumber,
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