const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');

// Admin management routes
router.get('/admins', authenticateToken, adminController.getAdmins);
router.post('/admins', authenticateToken, adminController.createAdmin);
router.put('/admins/:id/role', authenticateToken, adminController.updateAdminRole);
router.put('/admins/:id/deactivate', authenticateToken, adminController.deactivateAdmin);
router.get('/admin-logs', authenticateToken, adminController.getAdminLogs);
router.get('/my-admin-logs', authenticateToken, adminController.getMyAdminLogs);

module.exports = router;
