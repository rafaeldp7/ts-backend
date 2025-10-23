const express = require('express');
const router = express.Router();
const motorController = require('../controllers/motorController');
const { authenticateToken } = require('../middleware/auth');

// Motor routes
router.get('/', authenticateToken, motorController.getMotors);
router.get('/:id', authenticateToken, motorController.getMotor);
router.post('/', authenticateToken, motorController.createMotor);
router.put('/:id', authenticateToken, motorController.updateMotor);
router.delete('/:id', authenticateToken, motorController.deleteMotor);
router.put('/:id/fuel', authenticateToken, motorController.updateFuelLevel);
router.get('/:id/analytics', authenticateToken, motorController.getMotorAnalytics);
router.put('/:id/analytics', authenticateToken, motorController.updateMotorAnalytics);

module.exports = router;
