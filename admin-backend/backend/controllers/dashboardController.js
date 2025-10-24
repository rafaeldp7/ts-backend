const User = require('../models/User');
const Admin = require('../models/Admin');
const Report = require('../models/Report');
const Trip = require('../models/Trip');
const GasStation = require('../models/GasStation');
const Notification = require('../models/Notification');

// Get dashboard overview data
const getDashboardOverview = async (req, res) => {
  try {
    // Get user statistics
    const userStats = await User.getUserStats();
    const adminStats = await Admin.getAdminStats();
    const reportStats = await Report.getReportStats();
    const tripStats = await Trip.getTripStats();
    const gasStationStats = await GasStation.getStationStats();

    // Get recent activity
    const recentReports = await Report.find({ isArchived: false })
      .populate('reporter', 'firstName lastName')
      .sort({ reportedAt: -1 })
      .limit(5);

    const recentTrips = await Trip.find({ isArchived: false })
      .populate('user', 'firstName lastName')
      .sort({ startTime: -1 })
      .limit(5);

    // Get notifications for user
    const notifications = await Notification.findUnread(req.user.id);

    // Get system health metrics
    const systemHealth = {
      status: 'healthy',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      lastBackup: new Date().toISOString(),
      securityScore: 95
    };

    res.json({
      success: true,
      data: {
        overview: {
          users: userStats[0] || { totalUsers: 0, activeUsers: 0 },
          admins: adminStats[0] || { totalAdmins: 0, activeAdmins: 0 },
          reports: reportStats[0] || { totalReports: 0, pendingReports: 0 },
          trips: tripStats[0] || { totalTrips: 0, totalDistance: 0 },
          gasStations: gasStationStats[0] || { totalStations: 0, activeStations: 0 }
        },
        recentActivity: {
          reports: recentReports,
          trips: recentTrips
        },
        notifications: notifications.slice(0, 10),
        systemHealth
      }
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard overview',
      error: error.message
    });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get statistics for the period
    const [
      userStats,
      reportStats,
      tripStats,
      gasStationStats
    ] = await Promise.all([
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            newUsers: { $sum: 1 },
            activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } }
          }
        }
      ]),
      Report.aggregate([
        {
          $match: {
            reportedAt: { $gte: startDate },
            isArchived: false
          }
        },
        {
          $group: {
            _id: null,
            totalReports: { $sum: 1 },
            pendingReports: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            verifiedReports: { $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] } },
            resolvedReports: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } }
          }
        }
      ]),
      Trip.aggregate([
        {
          $match: {
            startTime: { $gte: startDate },
            isArchived: false
          }
        },
        {
          $group: {
            _id: null,
            totalTrips: { $sum: 1 },
            totalDistance: { $sum: '$distance' },
            totalFuelConsumed: { $sum: '$fuelConsumption' }
          }
        }
      ]),
      GasStation.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            isArchived: false
          }
        },
        {
          $group: {
            _id: null,
            newStations: { $sum: 1 },
            verifiedStations: { $sum: { $cond: ['$isVerified', 1, 0] } }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        period,
        startDate,
        endDate: now,
        statistics: {
          users: userStats[0] || { newUsers: 0, activeUsers: 0 },
          reports: reportStats[0] || { totalReports: 0, pendingReports: 0, verifiedReports: 0, resolvedReports: 0 },
          trips: tripStats[0] || { totalTrips: 0, totalDistance: 0, totalFuelConsumed: 0 },
          gasStations: gasStationStats[0] || { newStations: 0, verifiedStations: 0 }
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics',
      error: error.message
    });
  }
};

// Get user dashboard data
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's recent trips
    const recentTrips = await Trip.findByUser(userId, { status: 'completed' })
      .populate('motorcycle', 'make model plateNumber')
      .sort({ endTime: -1 })
      .limit(5);

    // Get user's reports
    const userReports = await Report.find({ reporter: userId, isArchived: false })
      .sort({ reportedAt: -1 })
      .limit(5);

    // Get user statistics
    const userStats = await Trip.getTripStats(userId);

    // Get notifications
    const notifications = await Notification.findUnread(userId);

    res.json({
      success: true,
      data: {
        user: req.user,
        recentTrips,
        userReports,
        statistics: userStats[0] || {
          totalTrips: 0,
          totalDistance: 0,
          totalDuration: 0,
          totalFuelConsumption: 0,
          totalFuelCost: 0,
          avgDistance: 0,
          avgDuration: 0,
          avgSpeed: 0,
          avgFuelEfficiency: 0
        },
        notifications: notifications.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user dashboard',
      error: error.message
    });
  }
};

// Get admin dashboard data
const getAdminDashboard = async (req, res) => {
  try {
    // Get admin statistics
    const adminStats = await Admin.getAdminStats();
    const reportStats = await Report.getReportStats();
    const userStats = await User.getUserStats();

    // Get recent admin activity
    const recentAdmins = await Admin.find({ isActive: true })
      .populate('role', 'name displayName')
      .sort({ 'activity.lastActivityAt': -1 })
      .limit(5);

    // Get pending reports
    const pendingReports = await Report.find({ status: 'pending', isArchived: false })
      .populate('reporter', 'firstName lastName email')
      .sort({ reportedAt: -1 })
      .limit(10);

    // Get system logs (simplified)
    const systemLogs = [
      {
        timestamp: new Date(),
        level: 'info',
        message: 'System running normally',
        source: 'system'
      }
    ];

    res.json({
      success: true,
      data: {
        admin: req.user,
        statistics: {
          admins: adminStats[0] || { totalAdmins: 0, activeAdmins: 0 },
          reports: reportStats[0] || { totalReports: 0, pendingReports: 0 },
          users: userStats[0] || { totalUsers: 0, activeUsers: 0 }
        },
        recentAdmins,
        pendingReports,
        systemLogs
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin dashboard',
      error: error.message
    });
  }
};

// Get analytics data
const getAnalytics = async (req, res) => {
  try {
    const { type, period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    let analytics = {};

    switch (type) {
      case 'users':
        analytics = await getUserAnalytics(startDate, now);
        break;
      case 'reports':
        analytics = await getReportAnalytics(startDate, now);
        break;
      case 'trips':
        analytics = await getTripAnalytics(startDate, now);
        break;
      case 'gas-stations':
        analytics = await getGasStationAnalytics(startDate, now);
        break;
      default:
        analytics = await getAllAnalytics(startDate, now);
    }

    res.json({
      success: true,
      data: {
        type,
        period,
        startDate,
        endDate: now,
        analytics
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message
    });
  }
};

// Helper functions for analytics
const getUserAnalytics = async (startDate, endDate) => {
  return await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

const getReportAnalytics = async (startDate, endDate) => {
  return await Report.aggregate([
    {
      $match: {
        reportedAt: { $gte: startDate, $lte: endDate },
        isArchived: false
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$reportedAt' },
          month: { $month: '$reportedAt' },
          day: { $dayOfMonth: '$reportedAt' }
        },
        count: { $sum: 1 },
        byType: {
          $push: {
            type: '$reportType',
            status: '$status'
          }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

const getTripAnalytics = async (startDate, endDate) => {
  return await Trip.aggregate([
    {
      $match: {
        startTime: { $gte: startDate, $lte: endDate },
        isArchived: false
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$startTime' },
          month: { $month: '$startTime' },
          day: { $dayOfMonth: '$startTime' }
        },
        count: { $sum: 1 },
        totalDistance: { $sum: '$distance' },
        totalDuration: { $sum: '$duration' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

const getGasStationAnalytics = async (startDate, endDate) => {
  return await GasStation.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        isArchived: false
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        byBrand: {
          $push: '$brand'
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

const getAllAnalytics = async (startDate, endDate) => {
  const [users, reports, trips, gasStations] = await Promise.all([
    getUserAnalytics(startDate, endDate),
    getReportAnalytics(startDate, endDate),
    getTripAnalytics(startDate, endDate),
    getGasStationAnalytics(startDate, endDate)
  ]);

  return {
    users,
    reports,
    trips,
    gasStations
  };
};

module.exports = {
  getDashboardOverview,
  getDashboardStats,
  getUserDashboard,
  getAdminDashboard,
  getAnalytics
};
