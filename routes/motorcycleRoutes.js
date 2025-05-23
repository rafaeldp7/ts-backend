const express = require("express");
const router = express.Router();
const motorcycleController = require("../controllers/motorcycleController");

// Get all motorcycles (excluding soft-deleted)
router.get("/", motorcycleController.getAllMotorcycles);

// Get all motorcycles including soft-deleted (for admin view)
router.get("/all", motorcycleController.getAllIncludingDeleted);

// Get total count of active motorcycles
router.get("/count", motorcycleController.getMotorcycleCount);

// Add a new motorcycle
router.post("/", motorcycleController.createMotorcycle);

// Update an existing motorcycle by ID
router.put("/:id", motorcycleController.updateMotorcycle);

// Soft delete a motorcycle by ID
router.delete("/:id", motorcycleController.deleteMotorcycle);

// Restore a soft-deleted motorcycle by ID
router.put("/restore/:id", motorcycleController.restoreMotorcycle);

module.exports = router;
