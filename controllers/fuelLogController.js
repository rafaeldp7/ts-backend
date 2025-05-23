const FuelLog = require("../models/FuelLogModel");

exports.getFuelLogsByUser = async (req, res) => {
  try {
    const logs = await FuelLog.find({ userId: req.params.userId })
      .populate({
        path: "motorId", // reference to UserMotor
        populate: {
          path: "motorcycleId", // reference to Motorcycle
          select: "model fuelConsumption", // include both model name and fuelConsumption
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch fuel logs", error: err.message });
  }
};

exports.createFuelLog = async (req, res) => {
  const { userId, motorId, liters, pricePerLiter, notes } = req.body;

  if (!userId || !motorId || !liters || !pricePerLiter) {
    return res.status(400).json({ msg: "All fields (userId, motorId, liters, pricePerLiter) are required" });
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
