const FuelLog = require("../models/FuelLog");
const moment = require("moment");

// ====================== USER CONTROLLERS ======================

// GET all fuel logs by user ID
exports.getFuelLogsByUser = async (req, res) => {
  try {
    const logs = await FuelLog.find({ userId: req.params.userId })
      .populate({
        path: "motorId",
        populate: {
          path: "motorcycleId",
          select: "model fuelConsumption",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch fuel logs", error: err.message });
  }
};

// CREATE a new fuel log
exports.createFuelLog = async (req, res) => {
  const { userId, motorId, liters, pricePerLiter, notes } = req.body;

  if (!userId || !motorId || !liters || !pricePerLiter) {
    return res.status(400).json({ msg: "Required fields: userId, motorId, liters, pricePerLiter" });
  }

  try {
    const totalCost = liters * pricePerLiter;
    const newLog = new FuelLog({
      userId,
      motorId,
      liters,
      pricePerLiter,
      totalCost,
      notes: notes || "",
    });

    await newLog.save();
    res.status(201).json({ msg: "Fuel log added successfully", fuelLog: newLog });
  } catch (err) {
    res.status(500).json({ msg: "Failed to create fuel log", error: err.message });
  }
};

// UPDATE a fuel log
exports.updateFuelLog = async (req, res) => {
  const { id } = req.params;
  const { liters, pricePerLiter, notes } = req.body;

  try {
    const totalCost = liters * pricePerLiter;
    const updated = await FuelLog.findByIdAndUpdate(
      id,
      { liters, pricePerLiter, totalCost, notes },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: "Fuel log not found" });

    res.status(200).json({ msg: "Fuel log updated", updated });
  } catch (err) {
    res.status(500).json({ msg: "Failed to update fuel log", error: err.message });
  }
};

// DELETE a fuel log
exports.deleteFuelLog = async (req, res) => {
  try {
    const deleted = await FuelLog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Fuel log not found" });

    res.status(200).json({ msg: "Fuel log deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete fuel log", error: err.message });
  }
};

// GET fuel log count
exports.getFuelLogCount = async (req, res) => {
  try {
    const count = await FuelLog.countDocuments();
    res.status(200).json({ totalFuelLogs: count });
  } catch (err) {
    res.status(500).json({ msg: "Failed to count fuel logs", error: err.message });
  }
};

// ====================== ADMIN ANALYTICS CONTROLLERS ======================

// 1. OVERVIEW: total logs, liters, cost
exports.getFuelLogOverview = async (req, res) => {
  try {
    const logs = await FuelLog.find({});
    const totalLogs = logs.length;
    const totalLiters = logs.reduce((sum, log) => sum + log.liters, 0);
    const totalCost = logs.reduce((sum, log) => sum + log.totalCost, 0);

    res.status(200).json({
      totalLogs,
      totalLiters: totalLiters.toFixed(2),
      totalCost: totalCost.toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to get fuel overview", error: err.message });
  }
};

// 2. AVERAGE FUEL BY MOTOR
exports.getAvgFuelByMotor = async (req, res) => {
  try {
    const result = await FuelLog.aggregate([
      {
        $group: {
          _id: "$motorId",
          averageLiters: { $avg: "$liters" },
          totalLogs: { $sum: 1 },
        },
      },
      { $sort: { averageLiters: -1 } },
    ]);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ msg: "Failed to get motor averages", error: err.message });
  }
};

// 3. TOP FUEL SPENDERS
exports.getTopFuelSpenders = async (req, res) => {
  try {
    const result = await FuelLog.aggregate([
      {
        $group: {
          _id: "$userId",
          totalSpent: { $sum: "$totalCost" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ msg: "Failed to get top fuel spenders", error: err.message });
  }
};

// 4. MONTHLY USAGE (FOR GRAPHING)
exports.getMonthlyFuelUsage = async (req, res) => {
  try {
    const result = await FuelLog.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          totalLiters: { $sum: "$liters" },
          totalCost: { $sum: "$totalCost" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const formatted = result.map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      totalLiters: item.totalLiters,
      totalCost: item.totalCost,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ msg: "Failed to get monthly usage", error: err.message });
  }
};
