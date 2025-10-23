const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Authenticate admin
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).populate('role');
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Invalid token or inactive admin.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Check permission
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin || !req.admin.role || !req.admin.role.permissions) {
      return res.status(403).json({ error: 'Access denied. No permissions found.' });
    }

    if (!req.admin.role.permissions[permission]) {
      return res.status(403).json({ error: `Access denied. Required permission: ${permission}` });
    }

    next();
  };
};

module.exports = {
  authenticateAdmin,
  checkPermission
};
