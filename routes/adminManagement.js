const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// First admin creation (no authentication required)
router.post('/first-admin', adminController.createFirstAdmin);

// Admin CRUD operations (no authentication for testing)
router.get('/admins', adminController.getAdmins);
router.get('/admins/:id', adminController.getAdmin);
router.post('/admins', adminController.createAdmin);
router.put('/admins/:id', adminController.updateAdmin);
router.put('/admins/:id/role', adminController.updateAdminRole);
router.put('/admins/:id/deactivate', adminController.deactivateAdmin);
router.put('/admins/:id/activate', adminController.activateAdmin);

// Role management
router.get('/admin-roles', adminController.getAdminRoles);
router.post('/admin-roles', adminController.createAdminRole);

// Activity logging
router.get('/admin-logs', adminController.getAdminLogs);
router.get('/my-admin-logs', adminController.getMyAdminLogs);

module.exports = router;
