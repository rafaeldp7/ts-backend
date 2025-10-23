const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");

// ============ USER SIDE ============
router.get("/", tripController.getTrips);                          // 🟢 Get all trips of a specific user
router.post("/", tripController.createTrip);                       // 🟢 Add a new trip
router.get("/:id", tripController.getTrip);                        // 🟢 Get a specific trip
router.put("/:id", tripController.updateTrip);                     // 🟢 Update a trip
router.delete("/:id", tripController.deleteTrip);                  // 🟢 Delete a trip

// ============ TRIP ACTIONS ============
router.post("/:id/complete", tripController.completeTrip);         // 🟢 Complete a trip
router.post("/:id/cancel", tripController.cancelTrip);             // 🟢 Cancel a trip
router.get("/:id/route", tripController.getTripRoute);              // 🟢 Get trip route
router.put("/:id/route", tripController.updateTripRoute);          // 🟢 Update trip route

// ============ ANALYTICS ============
router.get("/analytics/summary", tripController.getTripAnalytics); // 📊 Overall analytics

module.exports = router;
