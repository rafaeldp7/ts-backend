const Motorcycle = require("../models/motorcycleModel");

// Get all motorcycles
exports.getAllMotorcycles = async (req, res) => {
  try {
    const motorcycles = await Motorcycle.find();
    res.status(200).json(motorcycles);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch motorcycles", error: error.message });
  }
};

// Add a new motorcycle
exports.createMotorcycle = async (req, res) => {
  try {
    const newMotorcycle = new Motorcycle(req.body);
    await newMotorcycle.save();
    res.status(201).json({ msg: "Motorcycle created successfully", motorcycle: newMotorcycle });
  } catch (error) {
    res.status(400).json({ msg: "Failed to create motorcycle", error: error.message });
  }
};
