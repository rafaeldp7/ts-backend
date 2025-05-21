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
