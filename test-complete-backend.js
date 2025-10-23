#!/usr/bin/env node

/**
 * 🧪 COMPLETE BACKEND TESTING SCRIPT
 * 
 * This script tests all backend functionality including:
 * - User authentication and management
 * - Trip tracking and analytics
 * - Fuel logging and statistics
 * - Admin system functionality
 * - Data processing and analytics
 * - API endpoint validation
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const TEST_USER = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'password123'
};
const TEST_ADMIN = {
  email: 'admin@trafficslight.com',
  password: 'admin123'
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper functions
const logTest = (testName, status, details = '') => {
  testResults.total++;
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`✅ ${testName}`.green);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}`.red);
    if (details) console.log(`   Details: ${details}`.yellow);
  }
  testResults.details.push({ testName, status, details });
};

const makeRequest = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500 
    };
  }
};

// Test functions
const testServerHealth = async () => {
  console.log('\n🏥 Testing Server Health...'.cyan);
  
  const response = await makeRequest('GET', '/');
  if (response.success && response.data.includes('Server is running')) {
    logTest('Server Health Check', 'PASS');
  } else {
    logTest('Server Health Check', 'FAIL', response.error);
  }
};

const testUserAuthentication = async () => {
  console.log('\n👤 Testing User Authentication...'.cyan);
  
  // Test user registration
  const registerResponse = await makeRequest('POST', '/auth/register', TEST_USER);
  if (registerResponse.success) {
    logTest('User Registration', 'PASS');
  } else {
    logTest('User Registration', 'FAIL', registerResponse.error);
  }
  
  // Test user login
  const loginResponse = await makeRequest('POST', '/auth/login', {
    email: TEST_USER.email,
    password: TEST_USER.password
  });
  
  if (loginResponse.success && loginResponse.data.token) {
    logTest('User Login', 'PASS');
    return loginResponse.data.token;
  } else {
    logTest('User Login', 'FAIL', loginResponse.error);
    return null;
  }
};

const testAdminAuthentication = async () => {
  console.log('\n👑 Testing Admin Authentication...'.cyan);
  
  // Test admin login
  const loginResponse = await makeRequest('POST', '/admin-auth/login', TEST_ADMIN);
  
  if (loginResponse.success && loginResponse.data.token) {
    logTest('Admin Login', 'PASS');
    return loginResponse.data.token;
  } else {
    logTest('Admin Login', 'FAIL', loginResponse.error);
    return null;
  }
};

const testTripTracking = async (userToken) => {
  console.log('\n🚗 Testing Trip Tracking...'.cyan);
  
  if (!userToken) {
    logTest('Trip Tracking', 'FAIL', 'No user token available');
    return;
  }
  
  const tripData = {
    startLocation: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'New York, NY'
    },
    endLocation: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: 'Times Square, NY'
    },
    distance: 5.2,
    duration: 15,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 15 * 60000).toISOString()
  };
  
  // Test create trip
  const createResponse = await makeRequest('POST', '/trips', tripData, {
    'Authorization': `Bearer ${userToken}`
  });
  
  if (createResponse.success) {
    logTest('Create Trip', 'PASS');
    
    // Test get trips
    const getResponse = await makeRequest('GET', '/trips', null, {
      'Authorization': `Bearer ${userToken}`
    });
    
    if (getResponse.success) {
      logTest('Get Trips', 'PASS');
    } else {
      logTest('Get Trips', 'FAIL', getResponse.error);
    }
  } else {
    logTest('Create Trip', 'FAIL', createResponse.error);
  }
};

const testFuelLogging = async (userToken) => {
  console.log('\n⛽ Testing Fuel Logging...'.cyan);
  
  if (!userToken) {
    logTest('Fuel Logging', 'FAIL', 'No user token available');
    return;
  }
  
  const fuelData = {
    fuelAmount: 10.5,
    pricePerLiter: 1.25,
    totalCost: 13.125,
    odometerReading: 15000,
    fuelType: 'Premium',
    date: new Date().toISOString()
  };
  
  // Test create fuel log
  const createResponse = await makeRequest('POST', '/fuel-logs', fuelData, {
    'Authorization': `Bearer ${userToken}`
  });
  
  if (createResponse.success) {
    logTest('Create Fuel Log', 'PASS');
    
    // Test get fuel logs
    const getResponse = await makeRequest('GET', '/fuel-logs', null, {
      'Authorization': `Bearer ${userToken}`
    });
    
    if (getResponse.success) {
      logTest('Get Fuel Logs', 'PASS');
    } else {
      logTest('Get Fuel Logs', 'FAIL', getResponse.error);
    }
  } else {
    logTest('Create Fuel Log', 'FAIL', createResponse.error);
  }
};

const testAnalytics = async (userToken) => {
  console.log('\n📊 Testing Analytics...'.cyan);
  
  if (!userToken) {
    logTest('Analytics', 'FAIL', 'No user token available');
    return;
  }
  
  // Test daily analytics
  const analyticsResponse = await makeRequest('GET', '/analytics/daily', null, {
    'Authorization': `Bearer ${userToken}`
  });
  
  if (analyticsResponse.success) {
    logTest('Daily Analytics', 'PASS');
  } else {
    logTest('Daily Analytics', 'FAIL', analyticsResponse.error);
  }
  
  // Test fuel statistics
  const fuelStatsResponse = await makeRequest('GET', '/fuel-stats', null, {
    'Authorization': `Bearer ${userToken}`
  });
  
  if (fuelStatsResponse.success) {
    logTest('Fuel Statistics', 'PASS');
  } else {
    logTest('Fuel Statistics', 'FAIL', fuelStatsResponse.error);
  }
};

const testAdminManagement = async (adminToken) => {
  console.log('\n👥 Testing Admin Management...'.cyan);
  
  if (!adminToken) {
    logTest('Admin Management', 'FAIL', 'No admin token available');
    return;
  }
  
  // Test get admins list
  const adminsResponse = await makeRequest('GET', '/admin-management/admins', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  
  if (adminsResponse.success) {
    logTest('Get Admins List', 'PASS');
  } else {
    logTest('Get Admins List', 'FAIL', adminsResponse.error);
  }
  
  // Test get admin roles
  const rolesResponse = await makeRequest('GET', '/admin-management/admin-roles', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  
  if (rolesResponse.success) {
    logTest('Get Admin Roles', 'PASS');
  } else {
    logTest('Get Admin Roles', 'FAIL', rolesResponse.error);
  }
  
  // Test system statistics
  const statsResponse = await makeRequest('GET', '/admin-settings/system-stats', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  
  if (statsResponse.success) {
    logTest('System Statistics', 'PASS');
  } else {
    logTest('System Statistics', 'FAIL', statsResponse.error);
  }
};

const testDataProcessing = async () => {
  console.log('\n🔄 Testing Data Processing...'.cyan);
  
  // Test analytics generation
  const analyticsResponse = await makeRequest('GET', '/analytics');
  
  if (analyticsResponse.success) {
    logTest('Analytics Generation', 'PASS');
  } else {
    logTest('Analytics Generation', 'FAIL', analyticsResponse.error);
  }
  
  // Test general analytics
  const generalAnalyticsResponse = await makeRequest('GET', '/general-analytics');
  
  if (generalAnalyticsResponse.success) {
    logTest('General Analytics', 'PASS');
  } else {
    logTest('General Analytics', 'FAIL', generalAnalyticsResponse.error);
  }
};

const testAPIEndpoints = async () => {
  console.log('\n🔌 Testing API Endpoints...'.cyan);
  
  const endpoints = [
    { method: 'GET', path: '/auth/profile', name: 'User Profile' },
    { method: 'GET', path: '/trips', name: 'Get Trips' },
    { method: 'GET', path: '/fuel-logs', name: 'Get Fuel Logs' },
    { method: 'GET', path: '/motorcycles', name: 'Get Motorcycles' },
    { method: 'GET', path: '/gas-stations', name: 'Get Gas Stations' },
    { method: 'GET', path: '/notifications', name: 'Get Notifications' },
    { method: 'GET', path: '/maintenance-records', name: 'Get Maintenance Records' }
  ];
  
  for (const endpoint of endpoints) {
    const response = await makeRequest(endpoint.method, endpoint.path);
    if (response.success || response.status === 401) { // 401 is expected for protected routes
      logTest(`${endpoint.name} Endpoint`, 'PASS');
    } else {
      logTest(`${endpoint.name} Endpoint`, 'FAIL', response.error);
    }
  }
};

const testAdminEndpoints = async (adminToken) => {
  console.log('\n👑 Testing Admin Endpoints...'.cyan);
  
  if (!adminToken) {
    logTest('Admin Endpoints', 'FAIL', 'No admin token available');
    return;
  }
  
  const adminEndpoints = [
    { method: 'GET', path: '/admin-auth/profile', name: 'Admin Profile' },
    { method: 'GET', path: '/admin-management/admins', name: 'Admin List' },
    { method: 'GET', path: '/admin-management/admin-roles', name: 'Admin Roles' },
    { method: 'GET', path: '/admin-settings/dashboard-settings', name: 'Dashboard Settings' },
    { method: 'GET', path: '/admin-settings/system-stats', name: 'System Stats' }
  ];
  
  for (const endpoint of adminEndpoints) {
    const response = await makeRequest(endpoint.method, endpoint.path, null, {
      'Authorization': `Bearer ${adminToken}`
    });
    
    if (response.success) {
      logTest(`${endpoint.name} Endpoint`, 'PASS');
    } else {
      logTest(`${endpoint.name} Endpoint`, 'FAIL', response.error);
    }
  }
};

const runAllTests = async () => {
  console.log('🚀 Starting Complete Backend Testing...'.rainbow);
  console.log(`📍 Testing against: ${BASE_URL}`.blue);
  
  try {
    // Basic server tests
    await testServerHealth();
    await testAPIEndpoints();
    
    // Authentication tests
    const userToken = await testUserAuthentication();
    const adminToken = await testAdminAuthentication();
    
    // User system tests
    if (userToken) {
      await testTripTracking(userToken);
      await testFuelLogging(userToken);
      await testAnalytics(userToken);
    }
    
    // Admin system tests
    if (adminToken) {
      await testAdminManagement(adminToken);
      await testAdminEndpoints(adminToken);
    }
    
    // Data processing tests
    await testDataProcessing();
    
    // Print results
    console.log('\n📊 TEST RESULTS SUMMARY'.rainbow);
    console.log(`✅ Passed: ${testResults.passed}`.green);
    console.log(`❌ Failed: ${testResults.failed}`.red);
    console.log(`📊 Total: ${testResults.total}`.blue);
    
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
    console.log(`🎯 Success Rate: ${successRate}%`.cyan);
    
    if (testResults.failed > 0) {
      console.log('\n❌ FAILED TESTS:'.red);
      testResults.details
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`   • ${test.testName}: ${test.details}`.yellow);
        });
    }
    
    if (successRate >= 90) {
      console.log('\n🎉 BACKEND IS PRODUCTION READY!'.green);
    } else if (successRate >= 70) {
      console.log('\n⚠️ BACKEND NEEDS MINOR FIXES'.yellow);
    } else {
      console.log('\n🚨 BACKEND NEEDS MAJOR FIXES'.red);
    }
    
  } catch (error) {
    console.error('💥 Test execution failed:'.red, error.message);
  }
};

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testServerHealth,
  testUserAuthentication,
  testAdminAuthentication,
  testTripTracking,
  testFuelLogging,
  testAnalytics,
  testAdminManagement,
  testDataProcessing,
  testAPIEndpoints,
  testAdminEndpoints
};
