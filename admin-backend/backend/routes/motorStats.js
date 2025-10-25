const express = require('express');
const router = express.Router();
const motorStatsController = require('../controllers/motorStatsController');
const { authenticateAdmin } = require('../middleware/adminAuth');

// Motor statistics routes (all require admin authentication)
router.get('/total', authenticateAdmin, motorStatsController.getTotalMotors);
router.get('/models', authenticateAdmin, motorStatsController.getTotalMotorModels);
router.get('/statistics', authenticateAdmin, motorStatsController.getMotorStatistics);
router.get('/growth', authenticateAdmin, motorStatsController.getMotorGrowth);
router.get('/models-list', authenticateAdmin, motorStatsController.getMotorModelsList);

module.exports = router;
