const Motor = require('../../../models/Motor');
const UserMotor = require('../../../models/userMotorModel');
const { logAdminAction } = require('./adminLogsController');

// Get all motors (admin only)
const getMotors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, brand, model, year } = req.query;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { brand: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
        { plateNumber: new RegExp(search, 'i') }
      ];
    }
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (model) filter.model = new RegExp(model, 'i');
    if (year) filter.year = parseInt(year);

    const motors = await Motor.find(filter)
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Motor.countDocuments(filter);

    res.json({
      success: true,
      data: {
        motors,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get motors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get motors',
      error: error.message
    });
  }
};

// Get single motor
const getMotor = async (req, res) => {
  try {
    const motor = await Motor.findById(req.params.id).populate('owner', 'firstName lastName email');

    if (!motor) {
      return res.status(404).json({
        success: false,
        message: 'Motor not found'
      });
    }

    res.json({
      success: true,
      data: { motor }
    });
  } catch (error) {
    console.error('Get motor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get motor',
      error: error.message
    });
  }
};

// Update motor
const updateMotor = async (req, res) => {
  try {
    const { brand, model, year, plateNumber, color, engineSize, fuelType, isActive } = req.body;

    const motor = await Motor.findById(req.params.id);
    if (!motor) {
      return res.status(404).json({
        success: false,
        message: 'Motor not found'
      });
    }

    // Store original data for logging
    const originalData = {
      brand: motor.brand,
      model: motor.model,
      year: motor.year,
      plateNumber: motor.plateNumber,
      color: motor.color,
      engineSize: motor.engineSize,
      fuelType: motor.fuelType,
      isActive: motor.isActive
    };

    // Update fields
    if (brand) motor.brand = brand;
    if (model) motor.model = model;
    if (year) motor.year = year;
    if (plateNumber) motor.plateNumber = plateNumber;
    if (color) motor.color = color;
    if (engineSize) motor.engineSize = engineSize;
    if (fuelType) motor.fuelType = fuelType;
    if (isActive !== undefined) motor.isActive = isActive;

    await motor.save();

    // Log the motor update action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'UPDATE',
        'MOTOR',
        {
          description: `Updated motor: ${motor.brand} ${motor.model} (${motor.plateNumber})`,
          motorId: motor._id,
          motorBrand: motor.brand,
          motorModel: motor.model,
          motorPlateNumber: motor.plateNumber,
          changes: {
            before: originalData,
            after: {
              brand: motor.brand,
              model: motor.model,
              year: motor.year,
              plateNumber: motor.plateNumber,
              color: motor.color,
              engineSize: motor.engineSize,
              fuelType: motor.fuelType,
              isActive: motor.isActive
            }
          }
        },
        req
      );
    }

    res.json({
      success: true,
      message: 'Motor updated successfully',
      data: { motor }
    });
  } catch (error) {
    console.error('Update motor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update motor',
      error: error.message
    });
  }
};

// Delete motor
const deleteMotor = async (req, res) => {
  try {
    const motor = await Motor.findById(req.params.id);
    if (!motor) {
      return res.status(404).json({
        success: false,
        message: 'Motor not found'
      });
    }

    // Store motor data for logging before deletion
    const deletedMotorData = {
      id: motor._id,
      brand: motor.brand,
      model: motor.model,
      plateNumber: motor.plateNumber,
      owner: motor.owner
    };

    await Motor.findByIdAndDelete(req.params.id);

    // Log the motor deletion action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'DELETE',
        'MOTOR',
        {
          description: `Deleted motor: ${deletedMotorData.brand} ${deletedMotorData.model} (${deletedMotorData.plateNumber})`,
          motorId: deletedMotorData.id,
          motorBrand: deletedMotorData.brand,
          motorModel: deletedMotorData.model,
          motorPlateNumber: deletedMotorData.plateNumber,
          motorOwner: deletedMotorData.owner
        },
        req
      );
    }

    res.json({
      success: true,
      message: 'Motor deleted successfully'
    });
  } catch (error) {
    console.error('Delete motor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete motor',
      error: error.message
    });
  }
};

// Get motor statistics
const getMotorStats = async (req, res) => {
  try {
    const totalMotors = await Motor.countDocuments();
    const activeMotors = await Motor.countDocuments({ isActive: true });
    const newMotorsThisMonth = await Motor.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

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

    res.json({
      success: true,
      data: {
        overall: {
          totalMotors,
          activeMotors,
          inactiveMotors: totalMotors - activeMotors,
          newMotorsThisMonth
        },
        distribution: {
          byBrand: motorsByBrand,
          byYear: motorsByYear,
          byFuelType: motorsByFuelType
        }
      }
    });
  } catch (error) {
    console.error('Get motor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get motor statistics',
      error: error.message
    });
  }
};

// Get motors by brand
const getMotorsByBrand = async (req, res) => {
  try {
    const { brand } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const motors = await Motor.find({ brand: new RegExp(brand, 'i') })
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Motor.countDocuments({ brand: new RegExp(brand, 'i') });

    res.json({
      success: true,
      data: {
        motors,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get motors by brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get motors by brand',
      error: error.message
    });
  }
};

// Get user motors
const getUserMotors = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const userMotors = await UserMotor.find({ userId })
      .populate('motorId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await UserMotor.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        userMotors,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get user motors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user motors',
      error: error.message
    });
  }
};

// Create motor (admin only)
const createMotor = async (req, res) => {
  try {
    const { brand, model, year, plateNumber, color, engineSize, fuelType, ownerId } = req.body;

    // Check if plate number already exists
    if (plateNumber) {
      const existingMotor = await Motor.findOne({ plateNumber });
      if (existingMotor) {
        return res.status(400).json({
          success: false,
          message: 'Motor with this plate number already exists'
        });
      }
    }

    const motor = new Motor({
      brand,
      model,
      year,
      plateNumber,
      color,
      engineSize,
      fuelType,
      owner: ownerId,
      isActive: true
    });

    await motor.save();

    // If owner is specified, create user-motor relationship
    if (ownerId) {
      const userMotor = new UserMotor({
        userId: ownerId,
        motorId: motor._id,
        isPrimary: true
      });
      await userMotor.save();
    }

    // Log the motor creation action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'CREATE',
        'MOTOR',
        {
          description: `Created new motor: ${motor.brand} ${motor.model} (${motor.plateNumber})`,
          motorId: motor._id,
          motorBrand: motor.brand,
          motorModel: motor.model,
          motorPlateNumber: motor.plateNumber,
          motorOwner: motor.owner
        },
        req
      );
    }

    res.status(201).json({
      success: true,
      message: 'Motor created successfully',
      data: { motor }
    });
  } catch (error) {
    console.error('Create motor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create motor',
      error: error.message
    });
  }
};

module.exports = {
  getMotors,
  getMotor,
  createMotor,
  updateMotor,
  deleteMotor,
  getMotorStats,
  getMotorsByBrand,
  getUserMotors
};
