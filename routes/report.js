const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
// Report routes
router.get('/', reportController.getReports);
router.get('/nearby', reportController.getNearbyReports);
router.get('/verified', reportController.getVerifiedReports);
router.get('/:id', reportController.getReport);
router.get('/:id/verification', reportController.getReportVerification);
router.post('/', reportController.createReport);
router.put('/:id', reportController.updateReport);
router.delete('/:id', reportController.deleteReport);
router.post('/:id/vote', reportController.voteReport);
router.get('/:id/votes', reportController.getReportVotes);
router.put('/:id/status', reportController.updateReportStatus);

// Admin verification routes
router.put('/:id/verify', reportController.verifyReport);
router.post('/bulk-verify', reportController.bulkVerifyReports);

module.exports = router;
