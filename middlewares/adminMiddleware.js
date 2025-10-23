const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const AdminLog = require('../models/AdminLog');

// Middleware to authenticate admin
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id)
      .populate('role', 'name displayName permissions')
      .select('-password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. Admin not found.'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account deactivated. Please contact administrator.'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token.'
    });
  }
};

// Middleware to check admin permissions
const checkAdminPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const adminRole = req.admin.role;
    if (!adminRole || !adminRole.permissions[permission]) {
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions. Required: ${permission}`
      });
    }

    next();
  };
};

// Middleware to log admin activity
const logAdminActivity = (action, resource) => {
  return async (req, res, next) => {
    try {
      // Store original response methods
      const originalSend = res.send;
      const originalJson = res.json;

      // Override response methods to capture response data
      res.send = function(data) {
        // Log the activity after successful response
        if (res.statusCode < 400) {
          logActivity(req, action, resource, data);
        }
        return originalSend.call(this, data);
      };

      res.json = function(data) {
        // Log the activity after successful response
        if (res.statusCode < 400) {
          logActivity(req, action, resource, data);
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Error in admin activity logging:', error);
      next();
    }
  };
};

// Helper function to log admin activity
const logActivity = async (req, action, resource, responseData) => {
  try {
    if (!req.admin) return;

    const logData = {
      adminId: req.admin._id,
      adminName: req.admin.fullName,
      adminEmail: req.admin.email,
      action,
      resource,
      resourceId: req.params.id || null,
      resourceName: getResourceName(req, responseData),
      details: {
        description: `${action} ${resource}`,
        method: req.method,
        url: req.originalUrl,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        sessionId: req.sessionID || null,
        responseStatus: res.statusCode
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID || null,
      severity: getSeverity(action),
      status: res.statusCode < 400 ? 'SUCCESS' : 'FAILED'
    };

    const log = new AdminLog(logData);
    await log.save();
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
};

// Helper function to get resource name
const getResourceName = (req, responseData) => {
  if (responseData && responseData.data) {
    if (responseData.data.fullName) return responseData.data.fullName;
    if (responseData.data.name) return responseData.data.name;
    if (responseData.data.email) return responseData.data.email;
  }
  return req.params.id || 'Unknown';
};

// Helper function to determine severity
const getSeverity = (action) => {
  const highSeverityActions = ['DELETE', 'DEACTIVATE', 'ASSIGN_ROLE', 'REMOVE_ROLE'];
  const mediumSeverityActions = ['UPDATE', 'CREATE', 'PASSWORD_CHANGE'];
  
  if (highSeverityActions.includes(action)) return 'HIGH';
  if (mediumSeverityActions.includes(action)) return 'MEDIUM';
  return 'LOW';
};

// Middleware to check if admin can manage other admins
const canManageAdmins = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const adminRole = req.admin.role;
  if (!adminRole || !adminRole.permissions.canManageAdmins) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to manage admins'
    });
  }

  next();
};

// Middleware to check if admin can assign roles
const canAssignRoles = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const adminRole = req.admin.role;
  if (!adminRole || !adminRole.permissions.canAssignRoles) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to assign roles'
    });
  }

  next();
};

// Middleware to check if admin can export data
const canExportData = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const adminRole = req.admin.role;
  if (!adminRole || !adminRole.permissions.canExportData) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to export data'
    });
  }

  next();
};

module.exports = {
  authenticateAdmin,
  checkAdminPermission,
  logAdminActivity,
  canManageAdmins,
  canAssignRoles,
  canExportData
};
