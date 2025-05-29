const express = require("express");
const router = express.Router();
const controller = require("../controllers/fuelStatsController");

router.get("/:motorId", controller.getFuelStatsByMotor);

module.exports = router;
