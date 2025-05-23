const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");

// ===== USER SIDE =====
router.get("/user/:userId", tripController.getUserTrips);        // All trips for a specific user
router.post("/", tripController.addTrip);                        // Create a new trip

// ===== ADMIN SIDE =====
router.get("/", tripController.getAllTrips);                     // All trips (with population)
router.get("/count", tripController.getTripCount);               // Total trip count
router.delete("/:id", tripController.deleteTrip);                // Delete a specific trip
router.get("/user-trips/:userId", tripController.getTripsByUser); // Admin: get trips by user

// ===== ANALYTICS & INSIGHTS =====
router.get("/analytics", tripController.getTripAnalytics);           // Overall trip stats
router.get("/summary/month", tripController.getMonthlyTripSummary); // Monthly totals
router.get("/leaderboard", tripController.getTopUsersByTripCount);  // Top 5 users by trip count
router.get("/motors/most-used", tripController.getMostUsedMotors);  // Top 5 motors used

// ===== FILTERS =====
router.get("/date-range", tripController.getTripsByDateRange);      // Trips in a specific time range
router.get("/paginated", tripController.getPaginatedTrips);         // Paginated trip results

module.exports = router;
