const Admin = require('../../../models/Admin');
const User = require('../../../models/User');
const Trip = require('../../../models/TripModel');
const Report = require('../../../models/Reports');
const FuelLog = require('../../../models/FuelLogModel');
const Notification = require('../../../models/Notification');
const bcrypt = require('bcryptjs');

// Get dashboard settings
const getDashboardSettings = async (req, res) => {
  try {
    const settings = {
      dashboard: {
        showAnalytics: true,
        showRecentActivity: true,
        showSystemStats: true,
        refreshInterval: 30000, // 30 seconds
        itemsPerPage: 10
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        systemAlerts: true
      },
      security: {
        sessionTimeout: 3600, // 1 hour
        requireTwoFactor: false,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        }
      }
    };

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    console.error('Get dashboard settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard settings',
      error: error.message
    });
  }
};

// Update dashboard settings
const updateDashboardSettings = async (req, res) => {
  try {
    const { dashboard, notifications, security } = req.body;

    // In a real application, you would save these to a database
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Dashboard settings updated successfully',
      data: { dashboard, notifications, security }
    });
  } catch (error) {
    console.error('Update dashboard settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update dashboard settings',
      error: error.message
    });
  }
};

// Get system statistics
const getSystemStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalTrips,
      totalReports,
      totalFuelLogs,
      totalNotifications
    ] = await Promise.all([
      User.countDocuments(),
      Admin.countDocuments(),
      Trip.countDocuments(),
      Report.countDocuments(),
      FuelLog.countDocuments(),
      Notification.countDocuments()
    ]);

    const recentActivity = await Promise.all([
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      Trip.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      Report.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalAdmins,
          totalTrips,
          totalReports,
          totalFuelLogs,
          totalNotifications
        },
        recentActivity: {
          newUsers: recentActivity[0],
          newTrips: recentActivity[1],
          newReports: recentActivity[2]
        },
        systemHealth: {
          status: 'healthy',
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          timestamp: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system statistics',
      error: error.message
    });
  }
};

// Get activity summary
const getActivitySummary = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate;
    switch (period) {
      case '1d':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    const [
      userRegistrations,
      tripCreations,
      reportSubmissions,
      adminLogins
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Trip.countDocuments({ createdAt: { $gte: startDate } }),
      Report.countDocuments({ createdAt: { $gte: startDate } }),
      Admin.countDocuments({ lastLogin: { $gte: startDate } })
    ]);

    res.json({
      success: true,
      data: {
        period,
        startDate,
        endDate: new Date(),
        activity: {
          userRegistrations,
          tripCreations,
          reportSubmissions,
          adminLogins
        }
      }
    });
  } catch (error) {
    console.error('Get activity summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity summary',
      error: error.message
    });
  }
};

// Reset admin password
const resetAdminPassword = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    admin.password = hashedPassword;
    admin.updatedAt = new Date();
    await admin.save();

    res.json({
      success: true,
      message: 'Admin password reset successfully'
    });
  } catch (error) {
    console.error('Reset admin password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset admin password',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardSettings,
  updateDashboardSettings,
  getSystemStats,
  getActivitySummary,
  resetAdminPassword
};
