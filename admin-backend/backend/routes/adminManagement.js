const express = require('express');
const router = express.Router();
const adminManagementController = require('../controllers/adminManagementController');
const { authenticateAdmin, requirePermission } = require('../middleware/adminAuth');

// Admin management routes (with authentication)
router.get('/', authenticateAdmin, adminManagementController.getAdmins);
router.get('/roles', authenticateAdmin, adminManagementController.getAdminRoles);
router.get('/stats', authenticateAdmin, adminManagementController.getAdminStats);
router.get('/:id', authenticateAdmin, adminManagementController.getAdmin);
router.post('/', authenticateAdmin, requirePermission('admin.create'), adminManagementController.createAdmin);
router.post('/roles', authenticateAdmin, requirePermission('role.create'), adminManagementController.createAdminRole);
router.put('/:id', authenticateAdmin, requirePermission('admin.update'), adminManagementController.updateAdmin);
router.put('/roles/:id', authenticateAdmin, requirePermission('role.update'), adminManagementController.updateAdminRole);
router.delete('/:id', authenticateAdmin, requirePermission('admin.delete'), adminManagementController.deleteAdmin);
router.delete('/roles/:id', authenticateAdmin, requirePermission('role.delete'), adminManagementController.deleteAdminRole);

module.exports = router;