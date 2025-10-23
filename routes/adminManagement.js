const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateAdmin, checkPermission } = require('../middlewares/adminAuth');

// Admin CRUD operations
router.get('/admins', authenticateAdmin, checkPermission('canRead'), adminController.getAdmins);
router.get('/admins/:id', authenticateAdmin, checkPermission('canRead'), adminController.getAdmin);
router.post('/admins', authenticateAdmin, checkPermission('canManageAdmins'), adminController.createAdmin);
router.put('/admins/:id', authenticateAdmin, checkPermission('canUpdate'), adminController.updateAdmin);
router.put('/admins/:id/role', authenticateAdmin, checkPermission('canAssignRoles'), adminController.updateAdminRole);
router.put('/admins/:id/deactivate', authenticateAdmin, checkPermission('canManageAdmins'), adminController.deactivateAdmin);
router.put('/admins/:id/activate', authenticateAdmin, checkPermission('canManageAdmins'), adminController.activateAdmin);

// Role management
router.get('/admin-roles', authenticateAdmin, checkPermission('canRead'), adminController.getAdminRoles);
router.post('/admin-roles', authenticateAdmin, checkPermission('canManageAdmins'), adminController.createAdminRole);

// Activity logging
router.get('/admin-logs', authenticateAdmin, checkPermission('canRead'), adminController.getAdminLogs);
router.get('/my-admin-logs', authenticateAdmin, adminController.getMyAdminLogs);

module.exports = router;