const express = require("express");
const router = express.Router();
const controller = require("../controllers/fuelLogController");

router.get("/:userId", controller.getFuelLogsByUser);
router.post("/", controller.addFuelLog);

module.exports = router;
