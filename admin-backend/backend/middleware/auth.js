const jwt = require('jsonwebtoken');
const User = require('../../../models/User');
const Admin = require('../../../models/Admin');

// Authenticate JWT token - supports both User and Admin tokens
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Try to find admin first (since admin IDs are separate from user IDs)
    const admin = await Admin.findById(decoded.id).populate('role');
    if (admin && admin.isActive) {
      req.user = admin;
      req.user.isAdmin = true;
      return next();
    }

    // If not admin, try to find user
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive token. Please login again.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Authenticate admin token
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if admin exists and is active
    const admin = await Admin.findById(decoded.id).populate('role');
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive admin'
      });
    }

    req.user = admin;
    req.user.isAdmin = true;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Check admin permissions
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Check if user is super admin
const requireSuperAdmin = (req, res, next) => {
  if (!req.user.isAdmin || req.user.role.name !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  authenticateAdmin,
  checkPermission,
  requireAdmin,
  requireSuperAdmin
};
