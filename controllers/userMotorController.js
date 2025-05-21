const UserMotor = require("../models/userMotorModel");

// GET all user-motor links (with full user and motor details)
exports.getAllUserMotors = async (req, res) => {
  try {
    const userMotors = await UserMotor.find()
      .populate("motorcycleId")
      .populate("userId");

    res.status(200).json(userMotors);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch user motors", error: error.message });
  }
};

// GET all motors for a specific user
exports.getUserMotorsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const userMotors = await UserMotor.find({ userId })
      .populate("motorcycleId")
      .populate("userId");

    res.status(200).json(userMotors);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch motors for user", error: error.message });
  }
};

// POST a new user motor
exports.createUserMotor = async (req, res) => {
  try {
    const { userId, motorcycleId, plateNumber, nickname } = req.body;

    if (!userId || !motorcycleId || !plateNumber) {
      return res.status(400).json({ msg: "userId, motorcycleId, and plateNumber are required." });
    }

    const newUserMotor = new UserMotor({
      userId,
      motorcycleId,
      plateNumber,
      nickname,
    });

    await newUserMotor.save();

    res.status(201).json({
      msg: "User motor added successfully",
      userMotor: newUserMotor,
    });
  } catch (error) {
    res.status(400).json({ msg: "Failed to add user motor", error: error.message });
  }
};

// PUT update a user motor
exports.updateUserMotor = async (req, res) => {
  try {
    const { id } = req.params;
    const { motorcycleId, plateNumber, nickname } = req.body;

    const updated = await UserMotor.findByIdAndUpdate(
      id,
      { motorcycleId, plateNumber, nickname },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Motor entry not found" });
    }

    res.status(200).json({ msg: "User motor updated", updated });
  } catch (error) {
    res.status(400).json({ msg: "Failed to update", error: error.message });
  }
};

// DELETE a user motor
exports.deleteUserMotor = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await UserMotor.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ msg: "Motor entry not found" });
    }

    res.status(200).json({ msg: "User motor deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to delete", error: error.message });
  }
};
