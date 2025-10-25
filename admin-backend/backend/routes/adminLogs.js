const express = require('express');
const router = express.Router();
const adminLogsController = require('../controllers/adminLogsController');
const { authenticateAdmin, requirePermission } = require('../middleware/adminAuth');

// Admin logs routes (all require admin authentication)
router.get('/', authenticateAdmin, adminLogsController.getAdminLogs);
router.get('/stats', authenticateAdmin, adminLogsController.getAdminLogsStats);
router.get('/:id', authenticateAdmin, adminLogsController.getAdminLog);
router.delete('/:id', authenticateAdmin, requirePermission('canManageAdmins'), adminLogsController.deleteAdminLog);
router.post('/clean', authenticateAdmin, requirePermission('canManageAdmins'), adminLogsController.cleanOldLogs);

module.exports = router;
