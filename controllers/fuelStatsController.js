const FuelLog = require("../models/FuelLog");


// GET: Fuel stats (min, max, average) for a given motor
exports.getFuelStatsByMotor = async (req, res) => {
  try {
    const { motorId } = req.params;

    const logs = await FuelLog.find({ motorId });
    if (!logs.length) {
      return res.status(404).json({ msg: "No fuel logs found for this motor" });
    }

    const litersArray = logs.map((log) => log.liters);
    const total = litersArray.reduce((a, b) => a + b, 0);
    const average = total / litersArray.length;
    const min = Math.min(...litersArray);
    const max = Math.max(...litersArray);

    res.status(200).json({
      motorId,
      totalLogs: logs.length,
      fuelStats: {
        average: parseFloat(average.toFixed(2)),
        min,
        max
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch fuel stats", error: err.message });
  }
};
