const express = require('express');
const router = express.Router();
const adminSettingsController = require('../controllers/adminSettingsController');
const { authenticateAdmin, checkPermission } = require('../middleware/adminAuth');

// Settings routes
router.get('/dashboard-settings', authenticateAdmin, adminSettingsController.getDashboardSettings);
router.put('/dashboard-settings', authenticateAdmin, adminSettingsController.updateDashboardSettings);
router.get('/system-stats', authenticateAdmin, checkPermission('canViewAnalytics'), adminSettingsController.getSystemStats);
router.get('/activity-summary', authenticateAdmin, checkPermission('canViewAnalytics'), adminSettingsController.getActivitySummary);
router.put('/reset-password/:adminId', authenticateAdmin, checkPermission('canManageAdmins'), adminSettingsController.resetAdminPassword);

module.exports = router;