const express = require("express");
const router = express.Router();
const gasStationController = require("../controllers/gasStationController");
const isAdmin = require("../middleware/isAdmin"); // 🔒 Protect admin routes
const auth = require("../middleware/auth"); // For token validation

// USER
router.get("/nearby", gasStationController.getNearbyStations);

// ADMIN
router.get("/", auth, isAdmin, gasStationController.getAllStations);
router.get("/analytics", auth, isAdmin, gasStationController.getAnalytics);
router.get("/:id", auth, isAdmin, gasStationController.getStationById);
router.post("/", auth, isAdmin, gasStationController.createStation);
router.put("/:id", auth, isAdmin, gasStationController.adminUpdateStation);
router.delete("/:id", auth, isAdmin, gasStationController.deleteStation);

module.exports = router;
