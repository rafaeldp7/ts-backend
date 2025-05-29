// controllers/analyticsController.js
const Trip = require("../models/TripModel");
const FuelLog = require("../models/FuelLogModel");
const DailyAnalytics = require("../models/DailyAnalytics");
const UserMotor = require("../models/userMotorModel");

// Helper to get start and end of a day
const getDayRange = (targetDate) => {
  const start = new Date(targetDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(targetDate);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

exports.generateDailyAnalytics = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const { start, end } = getDayRange(date);

    // Get all motors with activity
    const userMotors = await UserMotor.find();

    for (const motor of userMotors) {
      const motorId = motor._id;
      const userId = motor.userId;

      // Trips today
      const trips = await Trip.find({
        motorId,
        createdAt: { $gte: start, $lte: end },
      });

      const tripCount = trips.length;
      const totalDistance = trips.reduce((sum, t) => sum + (t.actualDistance || 0), 0);
      const avgKmph = trips.length > 0 ? trips.reduce((sum, t) => sum + (t.kmph || 0), 0) / trips.length : 0;

      // Fuel logs today
      const fuelLogs = await FuelLog.find({
        motorId,
        createdAt: { $gte: start, $lte: end },
      });

      const totalFuel = fuelLogs.reduce((sum, f) => sum + f.liters, 0);

      const alerts = [];
      if (tripCount === 0) alerts.push("No trips recorded");
      if (totalFuel > 5) alerts.push("High fuel usage");
      if (avgKmph > 80) alerts.push("High average speed");

      // Upsert daily analytics
      await DailyAnalytics.findOneAndUpdate(
        { userId, motorId, date: start },
        {
          userId,
          motorId,
          date: start,
          totalDistance,
          totalFuelUsed: totalFuel,
          kmphAverage: avgKmph,
          trips: tripCount,
          alerts,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    res.status(200).json({ message: "Daily analytics generated successfully." });
  } catch (err) {
    console.error("Analytics generation error:", err);
    res.status(500).json({ message: "Failed to generate analytics", error: err.message });
  }
};
// ✅ Efficiency Analytics by Motor
exports.getMotorEfficiencyStats = async (req, res) => {
  try {
    const motors = await UserMotor.find().populate("motorcycleId");

    const results = await Promise.all(
      motors.map(async (motor) => {
        const motorId = motor._id;

        const trips = await Trip.find({ motorId });
        const fuelLogs = await FuelLog.find({ motorId });

        const totalDistance = trips.reduce((sum, t) => sum + (parseFloat(t.actualDistance || 0) || 0), 0);
        const totalTripFuel = trips.reduce((sum, t) => {
          const avg = ((t.actualFuelUsedMin || 0) + (t.actualFuelUsedMax || 0)) / 2;
          return sum + avg;
        }, 0);
        const totalFuelRefilled = fuelLogs.reduce((sum, log) => sum + (log.liters || 0), 0);
        const totalCost = fuelLogs.reduce((sum, log) => sum + (log.totalCost || 0), 0);

        const costPerKm = totalDistance ? totalCost / totalDistance : 0;
        const tripEfficiency = totalDistance && totalTripFuel ? totalDistance / totalTripFuel : 0;
        const refillEfficiency = totalDistance && totalFuelRefilled ? totalDistance / totalFuelRefilled : 0;

        return {
          motorId: motor._id,
          nickname: motor.nickname,
          model: motor.motorcycleId.model,
          engine: motor.motorcycleId.engineDisplacement,
          totalDistance,
          totalTripFuel: totalTripFuel.toFixed(2),
          totalFuelRefilled: totalFuelRefilled.toFixed(2),
          totalCost,
          costPerKm: costPerKm.toFixed(2),
          tripEfficiency: tripEfficiency.toFixed(2),
          refillEfficiency: refillEfficiency.toFixed(2)
        };
      })
    );

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ msg: "Failed to compute motor efficiency", error: err.message });
  }
};

exports.getUserAnalyticsTimeline = async (req, res) => {
  try {
    const userId = req.params.userId;

    const history = await DailyAnalytics.find({ userId }).sort({ date: 1 });

    const formatted = history.map(entry => ({
      date: entry.date,
      distance: entry.totalDistance,
      fuelUsedMin: entry.fuelUsedMin,
      fuelUsedMax: entry.fuelUsedMax,
      tripCount: entry.tripCount,
      cleanPointsEarned: entry.cleanPointsEarned,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch timeline data", error: err.message });
  }
};

exports.getUserFuelLogTrend = async (req, res) => {
  try {
    const userId = req.params.userId;

    const logs = await FuelLog.find({ userId }).sort({ date: 1 });

    const trend = logs.map(log => ({
      date: log.date,
      liters: log.liters,
      pricePerLiter: log.pricePerLiter,
      totalCost: log.totalCost,
      odometer: log.odometer || null,
      notes: log.notes || "",
    }));

    res.status(200).json(trend);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch fuel log trend", error: err.message });
  }
};
// GET top X most fuel-efficient motors
exports.getMotorEfficiencyRanking = async (req, res) => {
  try {
    const motors = await UserMotor.find({ "fuelConsumptionStats.average": { $ne: null } })
      .populate("userId", "name email")
      .populate("motorcycleId", "model")
      .sort({ "fuelConsumptionStats.average": -1 });

    res.status(200).json(motors);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch rankings", error: err.message });
  }
};