const express = require('express');
const router = express.Router();
const {
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  verifyReport,
  resolveReport,
  addComment,
  getReportsByLocation,
  getReportStats,
  archiveReport,
  reverseGeocodeReport,
  bulkReverseGeocodeReports,
  autoReverseGeocodeReport
} = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');
const { authenticateAdmin } = require('../middleware/adminAuth');

// Public routes (for viewing reports)
router.get('/', getReports);
router.get('/stats', getReportStats);
router.get('/location', getReportsByLocation);
router.get('/reverse-geocode', reverseGeocodeReport); // Public reverse geocoding endpoint

// Protected routes
router.get('/:id', getReport);
router.post('/', authenticateToken, createReport);
router.put('/:id', authenticateToken, updateReport);
router.delete('/:id', authenticateToken, deleteReport);
router.post('/:id/comments', authenticateToken, addComment);

// Admin routes
router.put('/:id/verify', authenticateAdmin, verifyReport);
router.put('/:id/resolve', authenticateAdmin, resolveReport);
router.put('/:id/archive', authenticateAdmin, archiveReport);
router.put('/:id/auto-reverse-geocode', authenticateAdmin, autoReverseGeocodeReport); // Auto-reverse geocode specific report
router.post('/bulk-reverse-geocode', authenticateAdmin, bulkReverseGeocodeReports); // Bulk reverse geocoding

module.exports = router;
