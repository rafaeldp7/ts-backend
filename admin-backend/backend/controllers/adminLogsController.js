const AdminLog = require('../../../models/AdminLog');
const Admin = require('../../../models/Admin');

// Helper function to log admin actions
const logAdminAction = async (adminId, action, resource, details = {}, req = null) => {
  try {
    // Get admin info for logging
    const admin = await Admin.findById(adminId);
    if (!admin) {
      console.error('Admin not found for logging:', adminId);
      return;
    }

    const logData = {
      adminId: adminId,
      adminName: `${admin.firstName} ${admin.lastName}`,
      adminEmail: admin.email,
      action: action,
      resource: resource,
      details: details,
      ipAddress: req ? req.ip : 'Unknown',
      userAgent: req ? req.get('User-Agent') : 'Unknown',
      timestamp: new Date()
    };

    const adminLog = new AdminLog(logData);
    await adminLog.save();
    
    console.log(`✅ Admin action logged: ${action} on ${resource} by ${admin.firstName} ${admin.lastName}`);
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Don't throw error to avoid breaking the main operation
  }
};

// Get all admin logs
const getAdminLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      action, 
      resource, 
      search,
      dateFrom,
      dateTo,
      adminId 
    } = req.query;
    
    const filter = {};
    
    // Build filter object
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (adminId) filter.adminId = adminId;
    
    // Date range filter
    if (dateFrom || dateTo) {
      filter.timestamp = {};
      if (dateFrom) filter.timestamp.$gte = new Date(dateFrom);
      if (dateTo) filter.timestamp.$lte = new Date(dateTo);
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { adminName: new RegExp(search, 'i') },
        { adminEmail: new RegExp(search, 'i') },
        { resourceName: new RegExp(search, 'i') },
        { 'details.description': new RegExp(search, 'i') }
      ];
    }

    const logs = await AdminLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('adminId', 'firstName lastName email');

    const total = await AdminLog.countDocuments(filter);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get admin logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin logs',
      error: error.message
    });
  }
};

// Get admin logs statistics
const getAdminLogsStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      totalLogs,
      todayLogs,
      uniqueAdmins
    ] = await Promise.all([
      AdminLog.countDocuments(),
      AdminLog.countDocuments({ timestamp: { $gte: today } }),
      AdminLog.distinct('adminId').then(ids => ids.length)
    ]);

    // Get action distribution
    const actionDistribution = await AdminLog.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get resource distribution
    const resourceDistribution = await AdminLog.aggregate([
      {
        $group: {
          _id: '$resource',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = await AdminLog.aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalLogs,
        todayLogs,
        uniqueAdmins,
        actionDistribution,
        resourceDistribution,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Get admin logs stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin logs statistics',
      error: error.message
    });
  }
};

// Get single admin log
const getAdminLog = async (req, res) => {
  try {
    const log = await AdminLog.findById(req.params.id)
      .populate('adminId', 'firstName lastName email');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Admin log not found'
      });
    }

    res.json({
      success: true,
      data: { log }
    });
  } catch (error) {
    console.error('Get admin log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin log',
      error: error.message
    });
  }
};

// Delete admin log (for cleanup purposes)
const deleteAdminLog = async (req, res) => {
  try {
    const log = await AdminLog.findById(req.params.id);
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Admin log not found'
      });
    }

    await AdminLog.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Admin log deleted successfully'
    });
  } catch (error) {
    console.error('Delete admin log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin log',
      error: error.message
    });
  }
};

// Clean old logs (older than specified days)
const cleanOldLogs = async (req, res) => {
  try {
    const { days = 90 } = req.body;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await AdminLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    res.json({
      success: true,
      message: `Cleaned ${result.deletedCount} old admin logs`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error('Clean old logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clean old logs',
      error: error.message
    });
  }
};

module.exports = {
  getAdminLogs,
  getAdminLogsStats,
  getAdminLog,
  deleteAdminLog,
  cleanOldLogs,
  logAdminAction
};
