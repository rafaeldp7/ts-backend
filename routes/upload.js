const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middlewares/authMiddleware');

// File upload routes
router.post('/images', protect, uploadController.getUploadConfig().single('image'), uploadController.uploadFile);
router.post('/documents', protect, uploadController.getUploadConfig().single('document'), uploadController.uploadFile);
router.post('/multiple', protect, uploadController.getUploadConfig().array('files', 5), uploadController.uploadMultipleFiles);
router.get('/:filename', uploadController.getFile);
router.delete('/:filename', protect, uploadController.deleteFile);

module.exports = router;
