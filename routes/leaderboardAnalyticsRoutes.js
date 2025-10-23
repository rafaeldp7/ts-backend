const express = require("express");
const router = express.Router();
const controller = require("../controllers/leaderboardsAnalyticsController");

router.get("/monthly", controller.getMonthlyLeaderboard);

module.exports = router;
