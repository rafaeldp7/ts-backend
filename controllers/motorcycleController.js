const Motorcycle = require("../models/motorcycleModel");

// Get all motorcycles (exclude soft-deleted)
exports.getAllMotorcycles = async (req, res) => {
  try {
    const motorcycles = await Motorcycle.find({ isDeleted: false });
    res.status(200).json(motorcycles);
  } catch (error) {
    res.status(500).json({
      msg: "Failed to fetch motorcycles",
      error: error.message,
    });
  }
};

// Optional: Get all motorcycles including soft-deleted (admin use)
exports.getAllIncludingDeleted = async (req, res) => {
  try {
    const motorcycles = await Motorcycle.find(); // No filter on isDeleted
    res.status(200).json(motorcycles);
  } catch (error) {
    res.status(500).json({
      msg: "Failed to fetch all motorcycles",
      error: error.message,
    });
  }
};

// Add a new motorcycle
exports.createMotorcycle = async (req, res) => {
  try {
    const newMotorcycle = new Motorcycle(req.body);
    await newMotorcycle.save();
    res.status(201).json({
      msg: "Motorcycle created successfully",
      motorcycle: newMotorcycle,
    });
  } catch (error) {
    res.status(400).json({
      msg: "Failed to create motorcycle",
      error: error.message,
    });
  }
};

// Update an existing motorcycle
exports.updateMotorcycle = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMotor = await Motorcycle.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedMotor) {
      return res.status(404).json({ msg: "Motorcycle not found" });
    }

    res.status(200).json({
      msg: "Motorcycle updated successfully",
      motorcycle: updatedMotor,
    });
  } catch (error) {
    res.status(400).json({
      msg: "Failed to update motorcycle",
      error: error.message,
    });
  }
};

// Soft delete a motorcycle
exports.deleteMotorcycle = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMotor = await Motorcycle.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedMotor) {
      return res.status(404).json({ msg: "Motorcycle not found" });
    }

    res.status(200).json({ msg: "Motorcycle soft-deleted successfully" });
  } catch (error) {
    res.status(500).json({
      msg: "Failed to delete motorcycle",
      error: error.message,
    });
  }
};

// Restore a soft-deleted motorcycle
exports.restoreMotorcycle = async (req, res) => {
  try {
    const { id } = req.params;

    const restoredMotor = await Motorcycle.findByIdAndUpdate(
      id,
      { isDeleted: false },
      { new: true }
    );

    if (!restoredMotor) {
      return res.status(404).json({ msg: "Motorcycle not found" });
    }

    res.status(200).json({
      msg: "Motorcycle restored successfully",
      motorcycle: restoredMotor,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Failed to restore motorcycle",
      error: error.message,
    });
  }
};
