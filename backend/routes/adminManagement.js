const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { 
  authenticateAdmin, 
  checkAdminPermission, 
  logAdminActivity,
  canManageAdmins,
  canAssignRoles,
  canExportData
} = require('../middleware/adminMiddleware');

// Admin management routes
router.get('/admins', 
  authenticateAdmin, 
  checkAdminPermission('canRead'),
  logAdminActivity('READ', 'ADMIN'),
  adminController.getAdmins
);

router.get('/admins/:id', 
  authenticateAdmin, 
  checkAdminPermission('canRead'),
  logAdminActivity('READ', 'ADMIN'),
  adminController.getAdmin
);

router.post('/admins', 
  authenticateAdmin, 
  canManageAdmins,
  logAdminActivity('CREATE', 'ADMIN'),
  adminController.createAdmin
);

router.put('/admins/:id', 
  authenticateAdmin, 
  checkAdminPermission('canUpdate'),
  logAdminActivity('UPDATE', 'ADMIN'),
  adminController.updateAdmin
);

router.put('/admins/:id/role', 
  authenticateAdmin, 
  canAssignRoles,
  logAdminActivity('ASSIGN_ROLE', 'ADMIN'),
  adminController.updateAdminRole
);

router.put('/admins/:id/deactivate', 
  authenticateAdmin, 
  canManageAdmins,
  logAdminActivity('DEACTIVATE', 'ADMIN'),
  adminController.deactivateAdmin
);

// Admin role management routes
router.get('/admin-roles', 
  authenticateAdmin, 
  checkAdminPermission('canRead'),
  adminController.getAdminRoles
);

router.post('/admin-roles', 
  authenticateAdmin, 
  canManageAdmins,
  logAdminActivity('CREATE', 'ADMIN'),
  adminController.createAdminRole
);

// Admin activity logging routes
router.get('/admin-logs', 
  authenticateAdmin, 
  checkAdminPermission('canRead'),
  adminController.getAdminLogs
);

router.get('/my-admin-logs', 
  authenticateAdmin, 
  adminController.getMyAdminLogs
);

module.exports = router;