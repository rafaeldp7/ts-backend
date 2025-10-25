const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateAdmin } = require('../middleware/adminAuth');

// Admin routes (all require authentication)
router.get('/', authenticateAdmin, userController.getUsers);
router.get('/stats', authenticateAdmin, userController.getUserStats);
router.get('/location', authenticateAdmin, userController.getUsersByLocation);
router.get('/:id', authenticateAdmin, userController.getUser);
router.post('/', authenticateAdmin, userController.createUser);
router.put('/:id', authenticateAdmin, userController.updateUser);
router.delete('/:id', authenticateAdmin, userController.deleteUser);

module.exports = router;