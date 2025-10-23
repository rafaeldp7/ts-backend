const express = require('express');
const router = express.Router();
const controller = require('../controllers/savedDestinationController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/:userId', protect, controller.getUserDestinations);
router.post('/', protect, controller.addDestination);
router.delete('/:id', protect, controller.deleteDestination);
router.put('/:id', protect, controller.updateDestination);

module.exports = router;
