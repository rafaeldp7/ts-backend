const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');


// File upload routes
router.post('/images',  uploadController.getUploadConfig().single('image'), uploadController.uploadFile);
router.post('/documents',  uploadController.getUploadConfig().single('document'), uploadController.uploadFile);
router.post('/multiple',  uploadController.getUploadConfig().array('files', 5), uploadController.uploadMultipleFiles);
router.get('/:filename', uploadController.getFile);
router.delete('/:filename',  uploadController.deleteFile);

module.exports = router;
