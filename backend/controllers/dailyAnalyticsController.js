const DailyAnalytics = require('../models/DailyAnalytics');

exports.getMotorDailyAnalyticsHistory = async (req, res) => {
  try {
    const motorId = req.params.motorId;

    const history = await DailyAnalytics.find({ motorId })
      .sort({ date: -1 })
      .limit(7); // Get last 7 days

    // Optional: sort ascending for chart
    const formatted = history.reverse().map(entry => ({
      date: entry.date.toISOString().split("T")[0],
      totalDistance: entry.totalDistance,
      totalFuelUsed: entry.totalFuelUsed,
      kmphAverage: entry.kmphAverage,
      trips: entry.trips,
      alerts: entry.alerts,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch daily analytics", error: err.message });
  }
};
