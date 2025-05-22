const FuelLog = require("../models/FuelLogModel");

exports.getFuelLogsByUser = async (req, res) => {
  try {
    const logs = await FuelLog.find({ userId: req.params.userId }).populate("motorId").sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch fuel logs", error: err.message });
  }
};

exports.addFuelLog = async (req, res) => {
  try {
    const { userId, motorId, liters, pricePerLiter } = req.body;

    if (!userId || !motorId || !liters || !pricePerLiter) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const totalCost = liters * pricePerLiter;

    const newLog = new FuelLog({
      userId,
      motorId,
      liters,
      pricePerLiter,
      totalCost,
    });

    await newLog.save();
    res.status(201).json({ msg: "Fuel log added", fuelLog: newLog });
  } catch (err) {
    res.status(500).json({ msg: "Failed to add fuel log", error: err.message });
  }
};
