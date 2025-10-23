const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images and documents
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and documents are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

class UploadController {
  // Upload single file
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      res.json({
        message: 'File uploaded successfully',
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ 
        error: 'Failed to upload file',
        message: error.message 
      });
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        path: `/uploads/${file.filename}`
      }));

      res.json({
        message: 'Files uploaded successfully',
        files: uploadedFiles
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ 
        error: 'Failed to upload files',
        message: error.message 
      });
    }
  }

  // Get uploaded file
  async getFile(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../uploads', filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      res.sendFile(filePath);
    } catch (error) {
      console.error('Error getting file:', error);
      res.status(500).json({ 
        error: 'Failed to get file',
        message: error.message 
      });
    }
  }

  // Delete uploaded file
  async deleteFile(req, res) {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../uploads', filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      fs.unlinkSync(filePath);
      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ 
        error: 'Failed to delete file',
        message: error.message 
      });
    }
  }

  // Get upload configuration
  getUploadConfig() {
    return upload;
  }
}

module.exports = new UploadController();
