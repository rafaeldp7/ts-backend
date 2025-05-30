// routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();
const { generateDailyAnalytics } = require("../controllers/analyticsController");
const {getMotorDailyAnalyticsHistory} = require("../controllers/dailyAnalyticsController");
const analyticsController = require("../controllers/analyticsController");


router.get("/generate-daily", generateDailyAnalytics);
router.get("/daily-history/:motorId", getMotorDailyAnalyticsHistory);
router.get("/user-timeline/:userId", analyticsController.getUserAnalyticsTimeline);


router.get("/fuel-log-trend/:userId", analyticsController.getUserFuelLogTrend);




module.exports = router;
