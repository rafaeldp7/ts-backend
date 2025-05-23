const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");

// User-side
router.get("/user/:userId", tripController.getUserTrips);
router.post("/", tripController.addTrip);

// Admin-side
router.get("/", tripController.getAllTrips);
router.get("/user-trips/:userId", tripController.getTripsByUser);
router.get("/date-range", tripController.getTripsByDateRange);
router.get("/paginated", tripController.getPaginatedTrips);
router.delete("/:id", tripController.deleteTrip);

module.exports = router;
