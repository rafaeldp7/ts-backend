const MaintenanceRecord = require("../models/maintenanceModel");

// POST /api/maintenance-records
exports.addMaintenanceRecord = async (req, res) => {
  try {
    const { userId, motorId, type, timestamp, location, details } = req.body;

    const record = new MaintenanceRecord({
      userId,
      motorId,
      type,
      timestamp,
      location,
      details,
    });

    const saved = await record.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error saving maintenance record:", err);
    res.status(500).json({ message: "Failed to save maintenance record" });
  }
};

// GET /api/maintenance-records/user/:userId
exports.getMaintenanceByUser = async (req, res) => {
  try {
    const records = await MaintenanceRecord.find({ userId: req.params.userId })
      .populate("motorId", "nickname")
      .sort({ timestamp: -1 });

    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch records" });
  }
};
