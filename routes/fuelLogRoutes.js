const express = require("express");
const router = express.Router();
const controller = require("../controllers/fuelLogController");

router.get("/:userId", controller.getFuelLogsByUser);
router.post("/", controller.createFuelLog);
router.get("/count", controller.getFuelLogCount);
module.exports = router;
