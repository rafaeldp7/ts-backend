const moment = require('moment');

// Generate random string
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate random number
const generateRandomNumber = (min = 100000, max = 999999) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Format date
const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

// Format datetime
const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(date).format(format);
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate bearing between two coordinates
const calculateBearing = (lat1, lng1, lat2, lng2) => {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
};

// Sanitize string
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

// Capitalize first letter
const capitalizeFirst = (str) => {
  if (typeof str !== 'string') return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Convert to title case
const toTitleCase = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Generate slug from string
const generateSlug = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Check if string is empty
const isEmpty = (str) => {
  return !str || str.trim().length === 0;
};

// Check if value is null or undefined
const isNullOrUndefined = (value) => {
  return value === null || value === undefined;
};

// Deep clone object
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// Merge objects deeply
const deepMerge = (target, source) => {
  const result = { ...target };
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  return result;
};

// Remove duplicates from array
const removeDuplicates = (arr) => {
  return [...new Set(arr)];
};

// Group array by key
const groupBy = (arr, key) => {
  return arr.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

// Sort array by key
const sortBy = (arr, key, order = 'asc') => {
  return arr.sort((a, b) => {
    if (order === 'desc') {
      return b[key] > a[key] ? 1 : -1;
    }
    return a[key] > b[key] ? 1 : -1;
  });
};

// Paginate array
const paginate = (arr, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return {
    data: arr.slice(startIndex, endIndex),
    pagination: {
      current: page,
      pages: Math.ceil(arr.length / limit),
      total: arr.length,
      limit
    }
  };
};

// Calculate percentage
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Format number with commas
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Format currency
const formatCurrency = (amount, currency = 'PHP') => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Generate pagination object
const generatePagination = (page, limit, total) => {
  return {
    current: parseInt(page),
    pages: Math.ceil(total / limit),
    total: parseInt(total),
    limit: parseInt(limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  };
};

// Generate response object
const generateResponse = (success, message, data = null, pagination = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  if (pagination !== null) {
    response.pagination = pagination;
  }
  
  return response;
};

// Generate error response
const generateErrorResponse = (message, statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (errors !== null) {
    response.errors = errors;
  }
  
  return response;
};

// Generate success response
const generateSuccessResponse = (message, data = null, pagination = null) => {
  return generateResponse(true, message, data, pagination);
};

// Check if date is valid
const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

// Get date range
const getDateRange = (period) => {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'yesterday':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  return { startDate, endDate: now };
};

// Generate file name with timestamp
const generateFileName = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `${prefix}${timestamp}.${extension}`;
};

// Validate file type
const isValidFileType = (filename, allowedTypes) => {
  const extension = filename.split('.').pop().toLowerCase();
  return allowedTypes.includes(extension);
};

// Validate file size
const isValidFileSize = (size, maxSize) => {
  return size <= maxSize;
};

// Generate random color
const generateRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate random coordinates within bounds
const generateRandomCoordinates = (bounds) => {
  const { minLat, maxLat, minLng, maxLng } = bounds;
  const lat = minLat + (maxLat - minLat) * Math.random();
  const lng = minLng + (maxLng - minLng) * Math.random();
  return { lat, lng };
};

// Calculate average
const calculateAverage = (arr) => {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

// Calculate median
const calculateMedian = (arr) => {
  const sorted = arr.sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[middle - 1] + sorted[middle]) / 2 
    : sorted[middle];
};

// Calculate mode
const calculateMode = (arr) => {
  const frequency = {};
  let maxFreq = 0;
  let mode = null;
  
  arr.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1;
    if (frequency[val] > maxFreq) {
      maxFreq = frequency[val];
      mode = val;
    }
  });
  
  return mode;
};

module.exports = {
  generateRandomString,
  generateRandomNumber,
  formatDate,
  formatDateTime,
  calculateDistance,
  calculateBearing,
  isValidEmail,
  isValidPhone,
  sanitizeString,
  capitalizeFirst,
  toTitleCase,
  generateSlug,
  isEmpty,
  isNullOrUndefined,
  deepClone,
  deepMerge,
  removeDuplicates,
  groupBy,
  sortBy,
  paginate,
  calculatePercentage,
  formatNumber,
  formatCurrency,
  generatePagination,
  generateResponse,
  generateErrorResponse,
  generateSuccessResponse,
  isValidDate,
  getDateRange,
  generateFileName,
  isValidFileType,
  isValidFileSize,
  generateRandomColor,
  generateRandomCoordinates,
  calculateAverage,
  calculateMedian,
  calculateMode
};
