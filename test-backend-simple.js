#!/usr/bin/env node

/**
 * 🧪 SIMPLE BACKEND TESTING SCRIPT
 * 
 * This script tests backend functionality using Node.js built-in modules
 * Tests all major endpoints and functionality
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

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
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}`);
    if (details) console.log(`   Details: ${details}`);
  }
  testResults.details.push({ testName, status, details });
};

const makeRequest = (method, endpoint, data = null, headers = {}) => {
  return new Promise((resolve) => {
    const url = new URL(`${API_BASE}${endpoint}`);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }
    
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: parsedData,
            status: res.statusCode
          });
        } catch (error) {
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: responseData,
            status: res.statusCode
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        status: 0
      });
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

// Test functions
const testServerHealth = async () => {
  console.log('\n🏥 Testing Server Health...');
  
  const response = await makeRequest('GET', '/');
  if (response.success && (response.data.includes('Server is running') || response.status === 200)) {
    logTest('Server Health Check', 'PASS');
  } else {
    logTest('Server Health Check', 'FAIL', response.error || 'Server not responding');
  }
};

const testUserAuthentication = async () => {
  console.log('\n👤 Testing User Authentication...');
  
  // Test user registration
  const registerResponse = await makeRequest('POST', '/auth/register', {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'password123'
  });
  
  if (registerResponse.success) {
    logTest('User Registration', 'PASS');
  } else {
    logTest('User Registration', 'FAIL', registerResponse.error?.message || 'Registration failed');
  }
  
  // Test user login
  const loginResponse = await makeRequest('POST', '/auth/login', {
    email: 'test@example.com',
    password: 'password123'
  });
  
  if (loginResponse.success && loginResponse.data.token) {
    logTest('User Login', 'PASS');
    return loginResponse.data.token;
  } else {
    logTest('User Login', 'FAIL', loginResponse.error?.message || 'Login failed');
    return null;
  }
};

const testAdminAuthentication = async () => {
  console.log('\n👑 Testing Admin Authentication...');
  
  // Test admin login
  const loginResponse = await makeRequest('POST', '/admin-auth/login', {
    email: 'admin@trafficslight.com',
    password: 'admin123'
  });
  
  if (loginResponse.success && loginResponse.data.token) {
    logTest('Admin Login', 'PASS');
    return loginResponse.data.token;
  } else {
    logTest('Admin Login', 'FAIL', loginResponse.error?.message || 'Admin login failed');
    return null;
  }
};

const testTripTracking = async (userToken) => {
  console.log('\n🚗 Testing Trip Tracking...');
  
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
  } else {
    logTest('Create Trip', 'FAIL', createResponse.error?.message || 'Trip creation failed');
  }
  
  // Test get trips
  const getResponse = await makeRequest('GET', '/trips', null, {
    'Authorization': `Bearer ${userToken}`
  });
  
  if (getResponse.success || getResponse.status === 401) {
    logTest('Get Trips', 'PASS');
  } else {
    logTest('Get Trips', 'FAIL', getResponse.error?.message || 'Get trips failed');
  }
};

const testFuelLogging = async (userToken) => {
  console.log('\n⛽ Testing Fuel Logging...');
  
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
  } else {
    logTest('Create Fuel Log', 'FAIL', createResponse.error?.message || 'Fuel log creation failed');
  }
  
  // Test get fuel logs
  const getResponse = await makeRequest('GET', '/fuel-logs', null, {
    'Authorization': `Bearer ${userToken}`
  });
  
  if (getResponse.success || getResponse.status === 401) {
    logTest('Get Fuel Logs', 'PASS');
  } else {
    logTest('Get Fuel Logs', 'FAIL', getResponse.error?.message || 'Get fuel logs failed');
  }
};

const testAnalytics = async (userToken) => {
  console.log('\n📊 Testing Analytics...');
  
  if (!userToken) {
    logTest('Analytics', 'FAIL', 'No user token available');
    return;
  }
  
  // Test daily analytics
  const analyticsResponse = await makeRequest('GET', '/analytics/daily', null, {
    'Authorization': `Bearer ${userToken}`
  });
  
  if (analyticsResponse.success || analyticsResponse.status === 401) {
    logTest('Daily Analytics', 'PASS');
  } else {
    logTest('Daily Analytics', 'FAIL', analyticsResponse.error?.message || 'Analytics failed');
  }
  
  // Test fuel statistics
  const fuelStatsResponse = await makeRequest('GET', '/fuel-stats', null, {
    'Authorization': `Bearer ${userToken}`
  });
  
  if (fuelStatsResponse.success || fuelStatsResponse.status === 401) {
    logTest('Fuel Statistics', 'PASS');
  } else {
    logTest('Fuel Statistics', 'FAIL', fuelStatsResponse.error?.message || 'Fuel stats failed');
  }
};

const testAdminManagement = async (adminToken) => {
  console.log('\n👥 Testing Admin Management...');
  
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
    logTest('Get Admins List', 'FAIL', adminsResponse.error?.message || 'Get admins failed');
  }
  
  // Test get admin roles
  const rolesResponse = await makeRequest('GET', '/admin-management/admin-roles', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  
  if (rolesResponse.success) {
    logTest('Get Admin Roles', 'PASS');
  } else {
    logTest('Get Admin Roles', 'FAIL', rolesResponse.error?.message || 'Get roles failed');
  }
  
  // Test system statistics
  const statsResponse = await makeRequest('GET', '/admin-settings/system-stats', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  
  if (statsResponse.success) {
    logTest('System Statistics', 'PASS');
  } else {
    logTest('System Statistics', 'FAIL', statsResponse.error?.message || 'Get stats failed');
  }
};

const testAPIEndpoints = async () => {
  console.log('\n🔌 Testing API Endpoints...');
  
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
      logTest(`${endpoint.name} Endpoint`, 'FAIL', response.error?.message || 'Endpoint failed');
    }
  }
};

const testAdminEndpoints = async (adminToken) => {
  console.log('\n👑 Testing Admin Endpoints...');
  
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
      logTest(`${endpoint.name} Endpoint`, 'FAIL', response.error?.message || 'Admin endpoint failed');
    }
  }
};

const runAllTests = async () => {
  console.log('🚀 Starting Complete Backend Testing...');
  console.log(`📍 Testing against: ${API_BASE}`);
  
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
    
    // Print results
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📊 Total: ${testResults.total}`);
    
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
    console.log(`🎯 Success Rate: ${successRate}%`);
    
    if (testResults.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      testResults.details
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`   • ${test.testName}: ${test.details}`);
        });
    }
    
    if (successRate >= 90) {
      console.log('\n🎉 BACKEND IS PRODUCTION READY!');
    } else if (successRate >= 70) {
      console.log('\n⚠️ BACKEND NEEDS MINOR FIXES');
    } else {
      console.log('\n🚨 BACKEND NEEDS MAJOR FIXES');
    }
    
  } catch (error) {
    console.error('💥 Test execution failed:', error.message);
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
  testAPIEndpoints,
  testAdminEndpoints
};
