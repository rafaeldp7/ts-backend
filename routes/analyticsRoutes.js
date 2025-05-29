// routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();
const { generateDailyAnalytics } = require("../controllers/analyticsController");

router.get("/generate-daily", generateDailyAnalytics);

module.exports = router;
