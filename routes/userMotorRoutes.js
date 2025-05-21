const express = require("express");
const router = express.Router();
const userMotorController = require("../controllers/userMotorController");

// All motors
router.get("/", userMotorController.getAllUserMotors);

// Motors by specific user
router.get("/:userId", userMotorController.getUserMotorsByUserId);

// Create
router.post("/", userMotorController.createUserMotor);

// Update
router.put("/:id", userMotorController.updateUserMotor);

// Delete
router.delete("/:id", userMotorController.deleteUserMotor);

module.exports = router;
