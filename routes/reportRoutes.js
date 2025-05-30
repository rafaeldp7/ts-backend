const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// CREATE
router.post("/", reportController.createReport);

// READ
router.get("/", reportController.getAllReports);
router.get("/count", reportController.getReportCount);
router.get("/type/:type", reportController.getReportsByType);
router.post("/daterange", reportController.getReportsByDateRange);
router.get("/user/:userId", reportController.getReportsByUser);
router.get("/locations/all", reportController.getAllReportLocations);


// DELETE
router.delete("/:id", reportController.deleteReport);

module.exports = router;
