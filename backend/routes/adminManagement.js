const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

// Admin management routes
router.get('/admins', protect, adminController.getAdmins);
router.post('/admins', protect, adminController.createAdmin);
router.put('/admins/:id/role', protect, adminController.updateAdminRole);
router.put('/admins/:id/deactivate', protect, adminController.deactivateAdmin);
router.get('/admin-logs', protect, adminController.getAdminLogs);
router.get('/my-admin-logs', protect, adminController.getMyAdminLogs);

module.exports = router;
