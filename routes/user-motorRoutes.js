const express = require("express");
const router = express.Router();
const userMotorController = require("../controllers/userMotorController");

// GET all user-owned motors
router.get("/", userMotorController.getAllUserMotors);

// POST a new user-owned motor
router.post("/", userMotorController.createUserMotor);

module.exports = router;
