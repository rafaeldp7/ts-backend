const Motorcycle = require('../../../models/motorcycleModel');
const Motor = require('../../../models/Motor'); // Keep for user motorcycles
const UserMotor = require('../../../models/userMotorModel');
const { logAdminAction } = require('./adminLogsController');
const { sendErrorResponse, sendSuccessResponse } = require('../middleware/validation');

// Get all motorcycles (admin only) - Returns motorcycle catalog data
const getMotors = async (req, res) => {
  try {
    const { page = 1, limit = 1000, search, model, includeDeleted = false } = req.query;

    // Build filter for motorcycle catalog
    const filter = {};
    if (!includeDeleted) {
      filter.isDeleted = { $ne: true };
    }
    if (search) {
      filter.$or = [
        { model: new RegExp(search, 'i') }
      ];
    }
    if (model) filter.model = new RegExp(model, 'i');

    // Fetch motorcycles from catalog
    const motorcycles = await Motorcycle.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Motorcycle.countDocuments(filter);

    // Transform motorcycles data for frontend compatibility
    const transformedMotors = motorcycles.map(motorcycle => ({
      _id: motorcycle._id,
      id: motorcycle._id,
      model: motorcycle.model,
      engineDisplacement: motorcycle.engineDisplacement,
      power: motorcycle.power,
      torque: motorcycle.torque,
      fuelTank: motorcycle.fuelTank,
      fuelConsumption: motorcycle.fuelConsumption,
      isDeleted: motorcycle.isDeleted,
      createdAt: motorcycle.createdAt,
      updatedAt: motorcycle.updatedAt
    }));

    sendSuccessResponse(res, {
      motors: transformedMotors,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get motorcycles error:', error);
    sendErrorResponse(res, 500, 'Failed to get motorcycles', error);
  }
};

// Get single motorcycle
const getMotor = async (req, res) => {
  try {
    const motorcycle = await Motorcycle.findById(req.params.id);

    if (!motorcycle) {
      return sendErrorResponse(res, 404, 'Motorcycle not found');
    }

    sendSuccessResponse(res, { motor: motorcycle });
  } catch (error) {
    console.error('Get motorcycle error:', error);
    sendErrorResponse(res, 500, 'Failed to get motorcycle', error);
  }
};

// Update motorcycle
const updateMotor = async (req, res) => {
  try {
    const { model, engineDisplacement, power, torque, fuelTank, fuelConsumption } = req.body;

    const motorcycle = await Motorcycle.findById(req.params.id);
    if (!motorcycle) {
      return sendErrorResponse(res, 404, 'Motorcycle not found');
    }

    // Store original data for logging
    const originalData = {
      model: motorcycle.model,
      engineDisplacement: motorcycle.engineDisplacement,
      power: motorcycle.power,
      torque: motorcycle.torque,
      fuelTank: motorcycle.fuelTank,
      fuelConsumption: motorcycle.fuelConsumption
    };

    // Update fields
    if (model) motorcycle.model = model;
    if (engineDisplacement !== undefined) motorcycle.engineDisplacement = engineDisplacement;
    if (power !== undefined) motorcycle.power = power;
    if (torque !== undefined) motorcycle.torque = torque;
    if (fuelTank !== undefined) motorcycle.fuelTank = fuelTank;
    if (fuelConsumption !== undefined) motorcycle.fuelConsumption = fuelConsumption;

    await motorcycle.save();

    // Log the motorcycle update action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'UPDATE',
        'MOTORCYCLE',
        {
          description: `Updated motorcycle: ${motorcycle.model}`,
          motorcycleId: motorcycle._id,
          motorcycleModel: motorcycle.model,
          changes: {
            before: originalData,
            after: {
              model: motorcycle.model,
              engineDisplacement: motorcycle.engineDisplacement,
              power: motorcycle.power,
              torque: motorcycle.torque,
              fuelTank: motorcycle.fuelTank,
              fuelConsumption: motorcycle.fuelConsumption
            }
          }
        },
        req
      );
    }

    sendSuccessResponse(res, { motor: motorcycle }, 'Motorcycle updated successfully');
  } catch (error) {
    console.error('Update motorcycle error:', error);
    sendErrorResponse(res, 500, 'Failed to update motorcycle', error);
  }
};

// Delete motorcycle
const deleteMotor = async (req, res) => {
  try {
    const motorcycle = await Motorcycle.findById(req.params.id);
    if (!motorcycle) {
      return sendErrorResponse(res, 404, 'Motorcycle not found');
    }

    // Store motorcycle data for logging before deletion
    const deletedMotorData = {
      id: motorcycle._id,
      model: motorcycle.model
    };

    // Soft delete - mark as deleted instead of removing
    motorcycle.isDeleted = true;
    await motorcycle.save();

    // Log the motorcycle deletion action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'DELETE',
        'MOTORCYCLE',
        {
          description: `Deleted motorcycle: ${deletedMotorData.model}`,
          motorcycleId: deletedMotorData.id,
          motorcycleModel: deletedMotorData.model
        },
        req
      );
    }

    sendSuccessResponse(res, null, 'Motorcycle deleted successfully');
  } catch (error) {
    console.error('Delete motorcycle error:', error);
    sendErrorResponse(res, 500, 'Failed to delete motorcycle', error);
  }
};

// Get motorcycle statistics
const getMotorStats = async (req, res) => {
  try {
    const totalMotors = await Motorcycle.countDocuments({ isDeleted: { $ne: true } });
    const deletedMotors = await Motorcycle.countDocuments({ isDeleted: true });
    const newMotorsThisMonth = await Motorcycle.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      },
      isDeleted: { $ne: true }
    });

    sendSuccessResponse(res, {
      overall: {
        totalMotors,
        deletedMotors,
        newMotorsThisMonth
      }
    });
  } catch (error) {
    console.error('Get motorcycle stats error:', error);
    sendErrorResponse(res, 500, 'Failed to get motorcycle statistics', error);
  }
};

// Get motorcycles by model
const getMotorsByBrand = async (req, res) => {
  try {
    const { model } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const motorcycles = await Motorcycle.find({ 
      model: new RegExp(model, 'i'),
      isDeleted: { $ne: true }
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Motorcycle.countDocuments({ 
      model: new RegExp(model, 'i'),
      isDeleted: { $ne: true }
    });

    sendSuccessResponse(res, {
      motors: motorcycles,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get motorcycles by model error:', error);
    sendErrorResponse(res, 500, 'Failed to get motorcycles by model', error);
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

    sendSuccessResponse(res, {
      userMotors,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get user motors error:', error);
    sendErrorResponse(res, 500, 'Failed to get user motors', error);
  }
};

// Create motorcycle (admin only)
const createMotor = async (req, res) => {
  try {
    const { model, engineDisplacement, power, torque, fuelTank, fuelConsumption } = req.body;

    // Check if model already exists
    if (model) {
      const existingMotor = await Motorcycle.findOne({ model });
      if (existingMotor) {
        return sendErrorResponse(res, 400, 'Motorcycle with this model already exists');
      }
    }

    const motorcycle = new Motorcycle({
      model,
      engineDisplacement,
      power,
      torque,
      fuelTank,
      fuelConsumption,
      isDeleted: false
    });

    await motorcycle.save();

    // Log the motorcycle creation action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'CREATE',
        'MOTORCYCLE',
        {
          description: `Created new motorcycle: ${motorcycle.model}`,
          motorcycleId: motorcycle._id,
          motorcycleModel: motorcycle.model,
          motorcycleFuelConsumption: motorcycle.fuelConsumption
        },
        req
      );
    }

    sendSuccessResponse(res, { motor: motorcycle }, 'Motorcycle created successfully');
  } catch (error) {
    console.error('Create motorcycle error:', error);
    sendErrorResponse(res, 500, 'Failed to create motorcycle', error);
  }
};

// Restore motorcycle (admin only)
const restoreMotor = async (req, res) => {
  try {
    const motorcycle = await Motorcycle.findById(req.params.id);
    if (!motorcycle) {
      return sendErrorResponse(res, 404, 'Motorcycle not found');
    }

    // Store motorcycle data for logging
    const restoredMotorData = {
      id: motorcycle._id,
      model: motorcycle.model
    };

    // Restore motorcycle
    motorcycle.isDeleted = false;
    await motorcycle.save();

    // Log the motorcycle restoration action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'UPDATE',
        'MOTORCYCLE',
        {
          description: `Restored motorcycle: ${restoredMotorData.model}`,
          motorcycleId: restoredMotorData.id,
          motorcycleModel: restoredMotorData.model,
          action: 'restore'
        },
        req
      );
    }

    sendSuccessResponse(res, { motor: motorcycle }, 'Motorcycle restored successfully');
  } catch (error) {
    console.error('Restore motorcycle error:', error);
    sendErrorResponse(res, 500, 'Failed to restore motorcycle', error);
  }
};

module.exports = {
  getMotors,
  getMotor,
  createMotor,
  updateMotor,
  deleteMotor,
  restoreMotor,
  getMotorStats,
  getMotorsByBrand,
  getUserMotors
};
