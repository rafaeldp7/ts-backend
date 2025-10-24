const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUser = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  handleValidationErrors
];

// Admin validation rules
const validateAdmin = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isMongoId()
    .withMessage('Valid role ID is required'),
  handleValidationErrors
];

// Report validation rules
const validateReport = [
  body('reportType')
    .notEmpty()
    .withMessage('Report type is required')
    .isIn(['Accident', 'Traffic Jam', 'Road Closure', 'Hazard', 'Construction', 'Other'])
    .withMessage('Invalid report type'),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('location.address')
    .notEmpty()
    .withMessage('Address is required'),
  body('location.barangay')
    .notEmpty()
    .withMessage('Barangay is required'),
  body('location.city')
    .notEmpty()
    .withMessage('City is required'),
  body('location.province')
    .notEmpty()
    .withMessage('Province is required'),
  body('location.coordinates.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  body('location.coordinates.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  handleValidationErrors
];

// Trip validation rules
const validateTrip = [
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('startLocation.address')
    .notEmpty()
    .withMessage('Start address is required'),
  body('startLocation.coordinates.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid start latitude is required'),
  body('startLocation.coordinates.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid start longitude is required'),
  body('endLocation.address')
    .notEmpty()
    .withMessage('End address is required'),
  body('endLocation.coordinates.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid end latitude is required'),
  body('endLocation.coordinates.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid end longitude is required'),
  body('distance')
    .isFloat({ min: 0 })
    .withMessage('Distance must be a positive number'),
  body('duration')
    .isFloat({ min: 0 })
    .withMessage('Duration must be a positive number'),
  body('startTime')
    .isISO8601()
    .withMessage('Valid start time is required'),
  body('endTime')
    .isISO8601()
    .withMessage('Valid end time is required'),
  body('motorcycle')
    .notEmpty()
    .withMessage('Motorcycle is required')
    .isMongoId()
    .withMessage('Valid motorcycle ID is required'),
  handleValidationErrors
];

// Gas station validation rules
const validateGasStation = [
  body('name')
    .notEmpty()
    .withMessage('Station name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('brand')
    .notEmpty()
    .withMessage('Brand is required')
    .isLength({ max: 50 })
    .withMessage('Brand cannot exceed 50 characters'),
  body('location.address')
    .notEmpty()
    .withMessage('Address is required'),
  body('location.barangay')
    .notEmpty()
    .withMessage('Barangay is required'),
  body('location.city')
    .notEmpty()
    .withMessage('City is required'),
  body('location.province')
    .notEmpty()
    .withMessage('Province is required'),
  body('location.coordinates.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  body('location.coordinates.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  handleValidationErrors
];

// Motorcycle validation rules
const validateMotorcycle = [
  body('make')
    .notEmpty()
    .withMessage('Make is required')
    .isLength({ max: 50 })
    .withMessage('Make cannot exceed 50 characters'),
  body('model')
    .notEmpty()
    .withMessage('Model is required')
    .isLength({ max: 50 })
    .withMessage('Model cannot exceed 50 characters'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Valid year is required'),
  body('plateNumber')
    .notEmpty()
    .withMessage('Plate number is required')
    .isLength({ min: 6, max: 20 })
    .withMessage('Plate number must be between 6 and 20 characters'),
  body('engineNumber')
    .notEmpty()
    .withMessage('Engine number is required'),
  body('chassisNumber')
    .notEmpty()
    .withMessage('Chassis number is required'),
  body('dimensions.weight')
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  body('performance.fuelCapacity')
    .isFloat({ min: 0 })
    .withMessage('Fuel capacity must be a positive number'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Valid ID is required'),
  handleValidationErrors
];

// Search validation
const validateSearch = [
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  handleValidationErrors
];

// Date range validation
const validateDateRange = [
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  handleValidationErrors
];

// Location validation
const validateLocation = [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  query('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  query('radius')
    .optional()
    .isInt({ min: 100, max: 50000 })
    .withMessage('Radius must be between 100 and 50000 meters'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUser,
  validateAdmin,
  validateReport,
  validateTrip,
  validateGasStation,
  validateMotorcycle,
  validatePagination,
  validateId,
  validateSearch,
  validateDateRange,
  validateLocation
};
