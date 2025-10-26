const mongoose = require('mongoose');

// Middleware to validate ObjectId parameters
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  next();
};

// Middleware to validate multiple ObjectId parameters
const validateObjectIds = (paramNames) => {
  return (req, res, next) => {
    for (const paramName of paramNames) {
      const id = req.params[paramName];
      if (id && !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${paramName} format`
        });
      }
    }
    next();
  };
};

// Standardized error response helper
const sendErrorResponse = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message: message
  };
  
  if (error && process.env.NODE_ENV === 'development') {
    response.error = error.message;
    response.stack = error.stack;
  }
  
  res.status(statusCode).json(response);
};

// Standardized success response helper
const sendSuccessResponse = (res, data = null, message = 'Success') => {
  const response = {
    success: true,
    message: message
  };
  
  if (data) {
    response.data = data;
  }
  
  res.json(response);
};

module.exports = {
  validateObjectId,
  validateObjectIds,
  sendErrorResponse,
  sendSuccessResponse
};