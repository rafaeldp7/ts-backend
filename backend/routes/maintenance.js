const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticateToken } = require('../middleware/auth');

// Maintenance routes
router.get('/', authenticateToken, maintenanceController.getMaintenanceRecords);
router.get('/:id', authenticateToken, maintenanceController.getMaintenanceRecord);
router.post('/', authenticateToken, maintenanceController.createMaintenanceRecord);
router.put('/:id', authenticateToken, maintenanceController.updateMaintenanceRecord);
router.delete('/:id', authenticateToken, maintenanceController.deleteMaintenanceRecord);
router.get('/motor/:motorId', authenticateToken, maintenanceController.getMotorMaintenance);
router.get('/motor/:motorId/analytics', authenticateToken, maintenanceController.getMaintenanceAnalytics);

module.exports = router;
