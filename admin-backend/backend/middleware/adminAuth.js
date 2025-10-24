const jwt = require('jsonwebtoken');
const Admin = require('../../../models/Admin');

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const admin = await Admin.findById(decoded.id).populate('role');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Admin not found.'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    req.user = {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      permissions: admin.role?.permissions || []
    };
    
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Super Admin bypasses all permission checks
    if (req.user.role?.level === 100) {
      return next();
    }

    // Check if user has the specific permission
    if (!req.user.role?.permissions?.[permission]) {
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required: ${permission}`
      });
    }

    next();
  };
};

const requireRole = (roleName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const roleLevels = {
      'super_admin': 100,
      'admin': 50,
      'moderator': 25
    };

    const requiredLevel = roleLevels[roleName];
    const userLevel = req.user.role?.level || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        message: `Insufficient role level. Required: ${roleName} or higher`
      });
    }

    next();
  };
};

// Middleware to check if user is Super Admin
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role?.level !== 100) {
    return res.status(403).json({
      success: false,
      message: 'Super Admin access required.'
    });
  }
  next();
};

// Middleware to check if user is Admin or higher
const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role?.level || 0) < 50) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required.'
    });
  }
  next();
};

module.exports = {
  authenticateAdmin,
  requirePermission,
  requireRole,
  requireSuperAdmin,
  requireAdmin
};