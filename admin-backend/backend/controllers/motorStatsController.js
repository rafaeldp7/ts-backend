const User = require('../../../models/User');
const UserMotor = require('../../../models/userMotorModel');
const Motorcycle = require('../../../models/motorcycleModel');

// Get total motors registered (count all motorcycles through users)
const getTotalMotors = async (req, res) => {
  try {
    // Count all motorcycles through UserMotor relationships
    const totalMotors = await UserMotor.countDocuments();
    
    res.status(200).json({ 
      success: true,
      totalMotors: totalMotors,
      message: `Total motors registered: ${totalMotors}`
    });
  } catch (error) {
    console.error('Get total motors error:', error);
    res.status(500).json({ 
      success: false,
      msg: "Failed to count total motors", 
      error: error.message 
    });
  }
};

// Get total motorcycle models (count from motorcycleModel.js)
const getTotalMotorModels = async (req, res) => {
  try {
    // Count all motorcycle models from the Motorcycle model
    const totalMotorModels = await Motorcycle.countDocuments({ isDeleted: { $ne: true } });
    
    res.status(200).json({ 
      success: true,
      totalMotorModels: totalMotorModels,
      message: `Total motorcycle models: ${totalMotorModels}`
    });
  } catch (error) {
    console.error('Get total motor models error:', error);
    res.status(500).json({ 
      success: false,
      msg: "Failed to count motorcycle models", 
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

    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total motors (through UserMotor relationships)
    const totalMotors = await UserMotor.countDocuments();
    
    // Get motors this month
    const motorsThisMonth = await UserMotor.countDocuments({
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });

    // Get total motorcycle models (from Motorcycle model)
    const totalMotorModels = await Motorcycle.countDocuments({ isDeleted: { $ne: true } });

    // Get motors by model (from UserMotor with populated motorcycle data)
    const motorsByModel = await UserMotor.aggregate([
      {
        $lookup: {
          from: 'motorcycles',
          localField: 'motorcycleId',
          foreignField: '_id',
          as: 'motorcycle'
        }
      },
      {
        $unwind: '$motorcycle'
      },
      {
        $group: {
          _id: '$motorcycle.model',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get motors by user (users with most motorcycles)
    const motorsByUser = await UserMotor.aggregate([
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          count: 1,
          userName: { $concat: ['$user.firstName', ' ', '$user.lastName'] }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      overview: {
        totalUsers,
        totalMotors,
        totalMotorModels,
        motorsThisMonth
      },
      distribution: {
        byModel: motorsByModel,
        byUser: motorsByUser
      },
      month: now.toLocaleString('default', { month: 'long', year: 'numeric' })
    });
  } catch (error) {
    console.error('Get motor statistics error:', error);
    res.status(500).json({
      success: false,
      msg: "Failed to get motor statistics",
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

    const motorGrowth = await UserMotor.aggregate([
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

    res.status(200).json({
      success: true,
      period,
      motorGrowth,
      totalGrowth: motorGrowth.reduce((sum, item) => sum + item.count, 0)
    });
  } catch (error) {
    console.error('Get motor growth error:', error);
    res.status(500).json({
      success: false,
      msg: "Failed to get motor growth",
      error: error.message
    });
  }
};

// Get motor models list
const getMotorModelsList = async (req, res) => {
  try {
    // Get all motorcycle models from the Motorcycle model
    const motorModels = await Motorcycle.find({ isDeleted: { $ne: true } })
      .select('model engineDisplacement power torque fuelTank fuelConsumption createdAt')
      .sort({ model: 1 });

    // Get usage count for each model through UserMotor relationships
    const modelUsage = await UserMotor.aggregate([
      {
        $lookup: {
          from: 'motorcycles',
          localField: 'motorcycleId',
          foreignField: '_id',
          as: 'motorcycle'
        }
      },
      {
        $unwind: '$motorcycle'
      },
      {
        $group: {
          _id: '$motorcycle.model',
          count: { $sum: 1 }
        }
      }
    ]);

    // Combine model data with usage count
    const modelsWithUsage = motorModels.map(model => {
      const usage = modelUsage.find(u => u._id === model.model);
      return {
        _id: model._id,
        model: model.model,
        engineDisplacement: model.engineDisplacement,
        power: model.power,
        torque: model.torque,
        fuelTank: model.fuelTank,
        fuelConsumption: model.fuelConsumption,
        usageCount: usage ? usage.count : 0,
        createdAt: model.createdAt
      };
    });

    res.status(200).json({
      success: true,
      motorModels: modelsWithUsage,
      totalModels: modelsWithUsage.length
    });
  } catch (error) {
    console.error('Get motor models list error:', error);
    res.status(500).json({
      success: false,
      msg: "Failed to get motor models list",
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
