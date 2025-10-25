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
  archiveReport
} = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');
const { authenticateAdmin } = require('../middleware/adminAuth');

// Public routes (for viewing reports)
router.get('/', getReports);
router.get('/stats', getReportStats);
router.get('/location', getReportsByLocation);

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

module.exports = router;
