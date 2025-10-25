const User = require('../../../models/User');

// Get total users count
const getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    res.json({
      success: true,
      data: {
        totalUsers,
        message: `Total users: ${totalUsers}`
      }
    });
  } catch (error) {
    console.error('Get total users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get total users',
      error: error.message
    });
  }
};

// Get users registered this month
const getUsersThisMonth = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const usersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });

    res.json({
      success: true,
      data: {
        usersThisMonth,
        month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
        message: `${usersThisMonth} users registered this month`
      }
    });
  } catch (error) {
    console.error('Get users this month error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users this month',
      error: error.message
    });
  }
};

// Get comprehensive user statistics
const getUserStatistics = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get users this month
    const usersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });

    // Get active users
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get users by month for the last 6 months
    const usersByMonth = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get users by city (top 10)
    const usersByCity = await User.aggregate([
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          usersThisMonth,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers
        },
        trends: {
          usersByMonth,
          usersByCity
        },
        month: now.toLocaleString('default', { month: 'long', year: 'numeric' })
      }
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
      error: error.message
    });
  }
};

// Get users growth over time
const getUserGrowth = async (req, res) => {
  try {
    const { period = '6months' } = req.query;
    
    let startDate;
    const now = new Date();
    
    switch (period) {
      case '1month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    }

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        userGrowth,
        totalGrowth: userGrowth.reduce((sum, item) => sum + item.count, 0)
      }
    });
  } catch (error) {
    console.error('Get user growth error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user growth',
      error: error.message
    });
  }
};

module.exports = {
  getTotalUsers,
  getUsersThisMonth,
  getUserStatistics,
  getUserGrowth
};
