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
