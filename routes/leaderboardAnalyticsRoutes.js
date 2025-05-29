const express = require("express");
const router = express.Router();
const controller = require("../controllers/leaderboardAnalyticsController");

router.get("/monthly", controller.getMonthlyLeaderboard);

module.exports = router;