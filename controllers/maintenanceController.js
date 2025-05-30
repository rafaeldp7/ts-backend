const MaintenanceRecord = require("../models/maintenanceModel");

// ✅ Create a new maintenance record
exports.createMaintenanceRecord = async (req, res) => {
  try {
    const {
      userId,
      motorId,
      type,
      timestamp,
      location,
      details
    } = req.body;

    const record = new MaintenanceRecord({
      userId,
      motorId,
      type,
      timestamp,
      location,
      details
    });

    const saved = await record.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Failed to save maintenance record", error: err.message });
  }
};

// ✅ Get all maintenance records for a specific motor
exports.getMotorMaintenanceRecords = async (req, res) => {
  try {
    const { motorId } = req.params;

    const records = await MaintenanceRecord.find({ motorId })
      .sort({ timestamp: -1 })
      .populate("motorId", "nickname")
      .populate("userId", "name email");

    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch records by motor", error: err.message });
  }
};

// ✅ Get all maintenance records for a specific user
exports.getUserMaintenanceRecords = async (req, res) => {
  try {
    const { userId } = req.params;

    const records = await MaintenanceRecord.find({ userId })
      .sort({ timestamp: -1 })
      .populate("motorId", "nickname")
      .populate("userId", "name email");

    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch records by user", error: err.message });
  }
};

// ✅ Get a single maintenance record by ID
exports.getMaintenanceRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await MaintenanceRecord.findById(id)
      .populate("motorId", "nickname")
      .populate("userId", "name email");

    if (!record) {
      return res.status(404).json({ message: "Maintenance record not found" });
    }

    res.status(200).json(record);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch record", error: err.message });
  }
};

// ✅ Optional: Delete a maintenance record by ID
exports.deleteMaintenanceRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await MaintenanceRecord.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Record not found to delete" });
    }

    res.status(200).json({ message: "Record deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete record", error: err.message });
  }
};
