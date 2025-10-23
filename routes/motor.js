const express = require('express');
const router = express.Router();
const motorController = require('../controllers/motorController');
// Motor routes
router.get('/', motorController.getMotors);
router.get('/:id', motorController.getMotor);
router.post('/', motorController.createMotor);
router.put('/:id', motorController.updateMotor);
router.delete('/:id', motorController.deleteMotor);
router.put('/:id/fuel', motorController.updateFuelLevel);
router.get('/:id/analytics', motorController.getMotorAnalytics);
router.put('/:id/analytics', motorController.updateMotorAnalytics);

module.exports = router;
