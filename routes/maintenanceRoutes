const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/maintenanceController");

// Create
router.post("/", maintenanceController.createMaintenanceRecord);

// Get all maintenance records
router.get("/", maintenanceController.getMaintenanceRecords);

// Get maintenance records for a specific motor
router.get("/motor/:motorId", maintenanceController.getMotorMaintenance);

// Analytics
router.get("/analytics/summary", maintenanceController.getMaintenanceAnalytics);

// Get single record by ID
router.get("/:id", maintenanceController.getMaintenanceRecord);

// Update maintenance record
router.put("/:id", maintenanceController.updateMaintenanceRecord);

// Delete maintenance record
router.delete("/:id", maintenanceController.deleteMaintenanceRecord);

module.exports = router;
