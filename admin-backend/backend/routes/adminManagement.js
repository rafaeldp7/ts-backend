const express = require('express');
const router = express.Router();
const adminManagementController = require('../controllers/adminManagementController');
const { authenticateAdmin, requirePermission, requireSuperAdmin } = require('../middleware/adminAuth');

// Public routes (no authentication required)
router.get('/roles', adminManagementController.getAdminRoles); // Public - just 3 fixed roles

// Admin management routes (with authentication)
router.get('/', authenticateAdmin, adminManagementController.getAdmins);
router.get('/stats', authenticateAdmin, adminManagementController.getAdminStats);
router.get('/:id', authenticateAdmin, adminManagementController.getAdmin);
router.post('/', authenticateAdmin, requirePermission('canManageAdmins'), adminManagementController.createAdmin);
router.put('/:id', authenticateAdmin, requirePermission('canManageAdmins'), adminManagementController.updateAdmin);
router.delete('/:id', authenticateAdmin, requirePermission('canManageAdmins'), adminManagementController.deleteAdmin);

// Password management routes
router.put('/:id/change-password', authenticateAdmin, adminManagementController.changeAdminPassword);
router.put('/change-password', authenticateAdmin, adminManagementController.changeOwnPassword);
router.put('/:id/reset-password', authenticateAdmin, requireSuperAdmin, adminManagementController.resetAdminPassword);

module.exports = router;