const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");

// ========== USER SIDE ==========
router.get("/user/:userId", tripController.getUserTrips);         // All trips by a specific user
router.post("/", tripController.addTrip);                         // Create a new trip

// ========== ADMIN SIDE ==========
router.get("/", tripController.getAllTrips);                      // All trips (admin view)
router.get("/paginated", tripController.getPaginatedTrips);       // Paginated trips
router.get("/user-trips/:userId", tripController.getTripsByUser); // Admin: get trips by user
router.delete("/:id", tripController.deleteTrip);                 // Delete specific trip

// ========== ANALYTICS ==========
router.get("/analytics", tripController.getTripAnalytics);        // Overall stats
router.get("/summary/month", tripController.getMonthlyTripSummary); // Monthly summary

// ========== INSIGHTS ==========
router.get("/leaderboard", tripController.getTopUsersByTripCount);  // Top 5 users
router.get("/motors/most-used", tripController.getMostUsedMotors); // Top 5 motors

// ========== FILTERS ==========
router.get("/date-range", tripController.getTripsByDateRange);    // Filter by date range

module.exports = router;
