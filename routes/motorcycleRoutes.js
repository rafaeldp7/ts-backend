const express = require("express");
const router = express.Router();
const motorcycleController = require("../controllers/motorcycleController");

// GET /api/motorcycles/
router.get("/", motorcycleController.getAllMotorcycles);

// POST /api/motorcycles/
router.post("/", motorcycleController.createMotorcycle);

module.exports = router;
