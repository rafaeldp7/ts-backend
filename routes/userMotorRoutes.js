const express = require("express");
const router = express.Router();
const controller = require("../controllers/userMotorController");

// Get all user-motor links with populated data
router.get("/", controller.getAllUserMotors);

// Get all motors for a specific user by user ID
router.get("/user/:id", controller.getUserMotorsByUserId);

// Create a new user motor link
router.post("/", controller.createUserMotor);

// Update an existing user motor by its ID
router.put("/:id", controller.updateUserMotor);

// Delete a user motor entry by ID
router.delete("/:id", controller.deleteUserMotor);

// Get count of all user-motor entries
router.get("/count/all", controller.getUserMotorCount);

module.exports = router;
