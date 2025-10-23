const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// CREATE
router.post("/", reportController.createReport);

// READ
router.get("/", reportController.getReports);
router.get("/nearby", reportController.getNearbyReports);
router.get("/:id", reportController.getReport);
router.get("/:id/votes", reportController.getReportVotes);
router.get("/verified/all", reportController.getVerifiedReports);
router.get("/:id/verification", reportController.getReportVerification);

// UPDATE
router.put("/:id", reportController.updateReport);
router.put("/:id/status", reportController.updateReportStatus);
router.put("/:id/verify", reportController.verifyReport);
router.put("/bulk-verify", reportController.bulkVerifyReports);

// VOTE
router.post("/:id/vote", reportController.voteReport);

// DELETE
router.delete("/:id", reportController.deleteReport);

module.exports = router;
