const express = require("express");
const router = express.Router();
const gasStationController = require("../controllers/gasStationsController");
// const isAdmin = require("../middleware/isAdmin"); // 🔒 Protect admin routes
const auth = require("../middlewares/authMiddleware"); // For token validation

// USER
router.get("/nearby", gasStationController.getNearbyStations);

// ADMIN ito kapag naayos na yung middlewares
// router.get("/", auth, isAdmin, gasStationController.getAllStations);
// router.get("/analytics", auth, isAdmin, gasStationController.getAnalytics);
// router.get("/:id", auth, isAdmin, gasStationController.getStationById);
// router.post("/", auth, isAdmin, gasStationController.createStation);
// router.put("/:id", auth, isAdmin, gasStationController.adminUpdateStation);
// router.delete("/:id", auth, isAdmin, gasStationController.deleteStation);


// For now, just token validation (can add isAdmin later)
router.get("/", gasStationController.getAllStations);
router.get("/import", gasStationController.fetchAndSaveFromGoogle);
router.get("/analytics", gasStationController.getAnalytics);
router.get("/:id", gasStationController.getStationById);
router.post("/", gasStationController.createStation);
router.put("/:id", gasStationController.adminUpdateStation);
router.delete("/:id", gasStationController.deleteStation);

router.get("/history/:id", gasStationController.getPriceHistoryByStation);



module.exports = router;
