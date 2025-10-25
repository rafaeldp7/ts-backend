const Motor = require('../../../models/Motor');
const UserMotor = require('../../../models/userMotorModel');

// Get total motors registered (all motors created by users)
const getTotalMotors = async (req, res) => {
  try {
    const totalMotors = await Motor.countDocuments();
    
    res.json({
      success: true,
      data: {
        totalMotors,
        message: `Total motors registered: ${totalMotors}`
      }
    });
  } catch (error) {
    console.error('Get total motors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get total motors',
      error: error.message
    });
  }
};

// Get total motor models (count of unique motor models)
const getTotalMotorModels = async (req, res) => {
  try {
    // Count distinct motor models (brand + model combination)
    const motorModels = await Motor.aggregate([
      {
        $group: {
          _id: {
            brand: '$brand',
            model: '$model'
          }
        }
      },
      {
        $count: 'totalModels'
      }
    ]);

    const totalModels = motorModels.length > 0 ? motorModels[0].totalModels : 0;
    
    res.json({
      success: true,
      data: {
        totalMotorModels: totalModels,
        message: `Total motor models: ${totalModels}`
      }
    });
  } catch (error) {
    console.error('Get total motor models error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get total motor models',
      error: error.message
    });
  }
};

// Get comprehensive motor statistics
const getMotorStatistics = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get total motors
    const totalMotors = await Motor.countDocuments();
    
    // Get motors this month
    const motorsThisMonth = await Motor.countDocuments({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });

    // Get active motors
    const activeMotors = await Motor.countDocuments({ isActive: true });

    // Get total motor models (distinct brand + model combinations)
    const motorModels = await Motor.aggregate([
      {
        $group: {
          _id: {
            brand: '$brand',
            model: '$model'
          }
        }
      },
      {
        $count: 'totalModels'
      }
    ]);

    const totalMotorModels = motorModels.length > 0 ? motorModels[0].totalModels : 0;

    // Get motors by brand
    const motorsByBrand = await Motor.aggregate([
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get motors by year
    const motorsByYear = await Motor.aggregate([
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    // Get motors by fuel type
    const motorsByFuelType = await Motor.aggregate([
      {
        $group: {
          _id: '$fuelType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get user-motor relationships
    const userMotorRelationships = await UserMotor.countDocuments();

    res.json({
      success: true,
      data: {
        overview: {
          totalMotors,
          totalMotorModels,
          motorsThisMonth,
          activeMotors,
          inactiveMotors: totalMotors - activeMotors,
          userMotorRelationships
        },
        distribution: {
          byBrand: motorsByBrand,
          byYear: motorsByYear,
          byFuelType: motorsByFuelType
        },
        month: now.toLocaleString('default', { month: 'long', year: 'numeric' })
      }
    });
  } catch (error) {
    console.error('Get motor statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get motor statistics',
      error: error.message
    });
  }
};

// Get motor growth over time
const getMotorGrowth = async (req, res) => {
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

    const motorGrowth = await Motor.aggregate([
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
        motorGrowth,
        totalGrowth: motorGrowth.reduce((sum, item) => sum + item.count, 0)
      }
    });
  } catch (error) {
    console.error('Get motor growth error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get motor growth',
      error: error.message
    });
  }
};

// Get motor models list
const getMotorModelsList = async (req, res) => {
  try {
    const motorModels = await Motor.aggregate([
      {
        $group: {
          _id: {
            brand: '$brand',
            model: '$model'
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          brand: '$_id.brand',
          model: '$_id.model',
          count: 1
        }
      },
      { $sort: { brand: 1, model: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        motorModels,
        totalModels: motorModels.length
      }
    });
  } catch (error) {
    console.error('Get motor models list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get motor models list',
      error: error.message
    });
  }
};

module.exports = {
  getTotalMotors,
  getTotalMotorModels,
  getMotorStatistics,
  getMotorGrowth,
  getMotorModelsList
};
