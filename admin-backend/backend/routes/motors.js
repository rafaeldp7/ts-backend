const express = require('express');
const router = express.Router();
const motorController = require('../controllers/motorController');
const { authenticateAdmin, requirePermission } = require('../middleware/adminAuth');
const { validateObjectId } = require('../middleware/validation');

// Admin routes (all require authentication)
router.get('/', authenticateAdmin, motorController.getMotors);
router.get('/stats', authenticateAdmin, motorController.getMotorStats);
router.get('/brand/:brand', authenticateAdmin, motorController.getMotorsByBrand);
router.get('/user/:userId', authenticateAdmin, validateObjectId, motorController.getUserMotors);
router.get('/:id', authenticateAdmin, validateObjectId, motorController.getMotor);
router.post('/', authenticateAdmin, requirePermission('canManageUsers'), motorController.createMotor);
router.put('/:id', authenticateAdmin, requirePermission('canManageUsers'), validateObjectId, motorController.updateMotor);
router.delete('/:id', authenticateAdmin, requirePermission('canManageUsers'), validateObjectId, motorController.deleteMotor);
router.put('/restore/:id', authenticateAdmin, requirePermission('canManageUsers'), validateObjectId, motorController.restoreMotor);

module.exports = router;
