const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const { updateTripStatus } = tripController;


// ============ USER SIDE ============
router.get("/user/:userId", tripController.getUserTrips);         // 🟢 Get all trips of a specific user
router.post("/", tripController.addTrip);                         // 🟢 Add a new trip
router.put("/update-status/:tripId", tripController.updateTripStatus);


// ============ ADMIN SIDE ============
router.get("/", tripController.getAllTrips);                      // 🔵 Get all trips (admin)
router.delete("/:id", tripController.deleteTrip);                 // 🔵 Delete a trip by ID
router.get("/admin/user/:userId", tripController.getTripsByUser); // 🔵 Get trips of a user (admin view)
router.get("/filter/date", tripController.getTripsByDateRange);   // 🔵 Filter trips by date range
router.get("/paginate", tripController.getPaginatedTrips);        // 🔵 Get paginated trips

// ============ ANALYTICS ============
router.get("/analytics/summary", tripController.getTripAnalytics);          // 📊 Overall analytics
router.get("/analytics/monthly", tripController.getMonthlyTripSummary);     // 📊 Monthly summary

// ============ INSIGHTS ============
router.get("/insights/top-users", tripController.getTopUsersByTripCount);   // 🧠 Top 5 users by trip count
router.get("/insights/top-motors", tripController.getMostUsedMotors);       // 🧠 Top 5 most used motorcycles

module.exports = router;
