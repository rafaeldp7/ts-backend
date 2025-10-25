const express = require('express');
const router = express.Router();
const motorController = require('../controllers/motorController');
const { authenticateAdmin } = require('../middleware/adminAuth');

// Admin routes (all require authentication)
router.get('/', authenticateAdmin, motorController.getMotors);
router.get('/stats', authenticateAdmin, motorController.getMotorStats);
router.get('/brand/:brand', authenticateAdmin, motorController.getMotorsByBrand);
router.get('/user/:userId', authenticateAdmin, motorController.getUserMotors);
router.get('/:id', authenticateAdmin, motorController.getMotor);
router.post('/', authenticateAdmin, motorController.createMotor);
router.put('/:id', authenticateAdmin, motorController.updateMotor);
router.delete('/:id', authenticateAdmin, motorController.deleteMotor);

module.exports = router;
