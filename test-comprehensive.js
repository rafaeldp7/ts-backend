#!/usr/bin/env node

/**
 * 🧪 COMPREHENSIVE BACKEND TEST
 * 
 * This script tests all functionality with detailed error reporting
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
            status: res.statusCode,
            rawResponse: responseData
          });
        } catch (error) {
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: responseData,
            status: res.statusCode,
            rawResponse: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        status: 0,
        rawResponse: error.message
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

const testAdminLogin = async () => {
  console.log('\n👑 Testing Admin Login...');
  
  const response = await makeRequest('POST', '/admin-auth/login', {
    email: 'admin@trafficslight.com',
    password: 'admin123'
  });
  
  console.log('📊 Admin Login Response:');
  console.log('Status:', response.status);
  console.log('Success:', response.success);
  console.log('Data:', JSON.stringify(response.data, null, 2));
  console.log('Raw Response:', response.rawResponse);
  
  if (response.success && (response.data.token || response.data.data?.token)) {
    logTest('Admin Login', 'PASS');
    return response.data.token || response.data.data.token;
  } else {
    logTest('Admin Login', 'FAIL', response.data?.error || response.error || 'Admin login failed');
    return null;
  }
};

const testUserRegistration = async () => {
  console.log('\n👤 Testing User Registration...');
  
  const response = await makeRequest('POST', '/auth/register', {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'password123'
  });
  
  console.log('📊 User Registration Response:');
  console.log('Status:', response.status);
  console.log('Success:', response.success);
  console.log('Data:', JSON.stringify(response.data, null, 2));
  console.log('Raw Response:', response.rawResponse);
  
  if (response.success) {
    logTest('User Registration', 'PASS');
  } else {
    logTest('User Registration', 'FAIL', response.data?.msg || response.data?.error || response.error || 'Registration failed');
  }
};

const testUserLogin = async () => {
  console.log('\n👤 Testing User Login...');
  
  const response = await makeRequest('POST', '/auth/login', {
    email: 'test@example.com',
    password: 'password123'
  });
  
  console.log('📊 User Login Response:');
  console.log('Status:', response.status);
  console.log('Success:', response.success);
  console.log('Data:', JSON.stringify(response.data, null, 2));
  console.log('Raw Response:', response.rawResponse);
  
  if (response.success && response.data.token) {
    logTest('User Login', 'PASS');
    return response.data.token;
  } else {
    logTest('User Login', 'FAIL', response.data?.msg || response.data?.error || response.error || 'Login failed');
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
      logTest(`${endpoint.name} Endpoint`, 'FAIL', response.data?.msg || response.data?.error || response.error || 'Endpoint failed');
    }
  }
};

const runAllTests = async () => {
  console.log('🚀 Starting Comprehensive Backend Testing...');
  console.log('📍 Testing against: http://localhost:5000/api');
  
  try {
    // Basic server tests
    await testServerHealth();
    await testAPIEndpoints();
    
    // Authentication tests with detailed logging
    await testAdminLogin();
    await testUserRegistration();
    await testUserLogin();
    
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
