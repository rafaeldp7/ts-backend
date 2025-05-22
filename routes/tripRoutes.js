const express = require("express");
const router = express.Router();
const controller = require("../controllers/tripController");

router.get("/:userId", controller.getUserTrips);
router.post("/addTrip", controller.addTrip);

module.exports = router;
