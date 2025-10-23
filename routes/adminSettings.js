const express = require('express');
const router = express.Router();
const adminSettingsController = require('../controllers/adminSettingsController');

// Settings routes (no authentication for testing)
router.get('/dashboard-settings', adminSettingsController.getDashboardSettings);
router.put('/dashboard-settings', adminSettingsController.updateDashboardSettings);
router.get('/system-stats', adminSettingsController.getSystemStats);
router.get('/activity-summary', adminSettingsController.getActivitySummary);
router.put('/reset-password/:adminId', adminSettingsController.resetAdminPassword);

module.exports = router;
