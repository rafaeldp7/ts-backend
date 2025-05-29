const express = require("express");
const router = express.Router();
const {
  createOrUpdateAnalytics,
  getAllAnalytics,
  getAnalyticsByKey,
} = require("../controllers/generalAnalyticsController");

// 🔒 (Optional) Add authentication middleware here if needed

// Admin: Add or update analytics
router.post("/", createOrUpdateAnalytics);

// Admin: View all analytics entries
router.get("/", getAllAnalytics);

// App: Get analytics by key (e.g., "topReports", "trafficTrends")
router.get("/:key", getAnalyticsByKey);

module.exports = router;
