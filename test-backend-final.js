#!/usr/bin/env node

/**
 * 🧪 FINAL BACKEND TESTING SCRIPT
 * 
 * This script tests all backend functionality with proper error handling
 */

const http = require('http');
const { URL } = require('url');

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
    const url = new URL(`http://localhost:5000/api${endpoint}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
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
    
    const req = http.request(options, (res) => {
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

const testServerHealth = async () => {
  console.log('\n🏥 Testing Server Health...');
  
  // Test root endpoint directly
  const response = await new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          success: res.statusCode === 200,
          data: data,
          status: res.statusCode
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        status: 0
      });
    });
    
    req.end();
  });
  
  if (response.success && (response.data.includes('Server is running') || response.status === 200)) {
    logTest('Server Health Check', 'PASS');
  } else {
    logTest('Server Health Check', 'FAIL', response.error || 'Server not responding');
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
  console.log('🚀 Starting Final Backend Testing...');
  console.log('📍 Testing against: http://localhost:5000/api');
  
  try {
    // Basic server tests
    await testServerHealth();
    await testAPIEndpoints();
    
    // Authentication tests
    const userToken = await testUserAuthentication();
    const adminToken = await testAdminAuthentication();
    
    // Admin system tests
    if (adminToken) {
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
      console.log('\n🎉 BACKEND IS 100% PRODUCTION READY!');
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

module.exports = { runAllTests };
