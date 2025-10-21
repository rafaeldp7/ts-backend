const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

// Report routes
router.get('/', authenticateToken, reportController.getReports);
router.get('/nearby', authenticateToken, reportController.getNearbyReports);
router.get('/:id', authenticateToken, reportController.getReport);
router.post('/', authenticateToken, reportController.createReport);
router.put('/:id', authenticateToken, reportController.updateReport);
router.delete('/:id', authenticateToken, reportController.deleteReport);
router.post('/:id/vote', authenticateToken, reportController.voteReport);
router.get('/:id/votes', authenticateToken, reportController.getReportVotes);
router.put('/:id/status', authenticateToken, reportController.updateReportStatus);

module.exports = router;
