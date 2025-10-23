const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
// Maintenance routes
router.get('/', maintenanceController.getMaintenanceRecords);
router.get('/:id', maintenanceController.getMaintenanceRecord);
router.post('/', maintenanceController.createMaintenanceRecord);
router.put('/:id', maintenanceController.updateMaintenanceRecord);
router.delete('/:id', maintenanceController.deleteMaintenanceRecord);
router.get('/motor/:motorId', maintenanceController.getMotorMaintenance);
router.get('/motor/:motorId/analytics', maintenanceController.getMaintenanceAnalytics);

module.exports = router;
