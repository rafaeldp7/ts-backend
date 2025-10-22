const User = require('../models/User');
const Report = require('../models/Report');
const GasStation = require('../models/GasStation');
const Motor = require('../models/Motor');
const Trip = require('../models/Trip');

class DashboardController {
  // Get dashboard overview statistics
  async getOverview(req, res) {
    try {
      const [
        totalUsers,
        totalReports,
        totalGasStations,
        totalMotors,
        totalTrips,
        newUsersThisMonth,
        newReportsThisMonth,
        newTripsThisMonth
      ] = await Promise.all([
        User.countDocuments(),
        Report.countDocuments(),
        GasStation.countDocuments(),
        Motor.countDocuments(),
        Trip.countDocuments(),
        User.countDocuments({
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }),
        Report.countDocuments({
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }),
        Trip.countDocuments({
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        })
      ]);

      res.json({
        totalUsers,
        totalReports,
        totalGasStations,
        totalMotors,
        totalTrips,
        newUsersThisMonth,
        newReportsThisMonth,
        newTripsThisMonth
      });
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      res.status(500).json({ 
        error: 'Failed to fetch dashboard overview',
        message: error.message 
      });
    }
  }

  // Get dashboard statistics
  async getStats(req, res) {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      
      // Get monthly user registrations
      const monthlyUsers = await User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(currentYear, 0, 1),
              $lt: new Date(currentYear + 1, 0, 1)
            }
          }
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      // Get monthly reports
      const monthlyReports = await Report.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(currentYear, 0, 1),
              $lt: new Date(currentYear + 1, 0, 1)
            }
          }
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      // Get reports by type
      const reportsByType = await Report.aggregate([
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 }
          }
        }
      ]);

      // Get gas stations by brand
      const gasStationsByBrand = await GasStation.aggregate([
        {
          $group: {
            _id: "$brand",
            count: { $sum: 1 }
          }
        }
      ]);

      // Initialize arrays with 12 zeros
      const userGrowth = new Array(12).fill(0);
      const reportTrends = new Array(12).fill(0);

      // Fill in actual data
      monthlyUsers.forEach(item => {
        userGrowth[item._id - 1] = item.count;
      });

      monthlyReports.forEach(item => {
        reportTrends[item._id - 1] = item.count;
      });

      res.json({
        userGrowth,
        reportTrends,
        reportsByType: reportsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        gasStationsByBrand: gasStationsByBrand.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ 
        error: 'Failed to fetch dashboard stats',
        message: error.message 
      });
    }
  }

  // Get analytics data
  async getAnalytics(req, res) {
    try {
      const { period = '30d' } = req.query;
      
      let startDate;
      const now = new Date();
      
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
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const [
        userAnalytics,
        reportAnalytics,
        tripAnalytics
      ] = await Promise.all([
        this.getUserAnalytics(startDate),
        this.getReportAnalytics(startDate),
        this.getTripAnalytics(startDate)
      ]);

      res.json({
        period,
        userAnalytics,
        reportAnalytics,
        tripAnalytics
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ 
        error: 'Failed to fetch analytics',
        message: error.message 
      });
    }
  }

  // Get user analytics
  async getUserAnalytics(startDate) {
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    const activeUsers = await User.countDocuments({ 
      lastLogin: { $gte: startDate } 
    });

    return {
      totalUsers,
      newUsers,
      activeUsers,
      growthRate: totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(2) : 0
    };
  }

  // Get report analytics
  async getReportAnalytics(startDate) {
    const totalReports = await Report.countDocuments();
    const newReports = await Report.countDocuments({ createdAt: { $gte: startDate } });
    const verifiedReports = await Report.countDocuments({ isVerified: true });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });

    return {
      totalReports,
      newReports,
      verifiedReports,
      resolvedReports,
      verificationRate: totalReports > 0 ? ((verifiedReports / totalReports) * 100).toFixed(2) : 0,
      resolutionRate: totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(2) : 0
    };
  }

  // Get trip analytics
  async getTripAnalytics(startDate) {
    const totalTrips = await Trip.countDocuments();
    const newTrips = await Trip.countDocuments({ createdAt: { $gte: startDate } });
    
    const totalDistance = await Trip.aggregate([
      { $group: { _id: null, total: { $sum: "$distance" } } }
    ]);

    return {
      totalTrips,
      newTrips,
      totalDistance: totalDistance[0]?.total || 0
    };
  }
}

module.exports = new DashboardController();
