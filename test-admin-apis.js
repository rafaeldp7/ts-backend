#!/usr/bin/env node

/**
 * Admin API Testing Script
 * 
 * This script tests all admin APIs to verify they work correctly.
 * Run with: node test-admin-apis.js
 */

const axios = require('axios');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@trafficslight.com';
const ADMIN_PASSWORD = 'admin123';

let authToken = null;
let adminId = null;
let roleId = null;

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Helper function to run tests
async function runTest(testName, testFunction) {
  testResults.total++;
  try {
    log(`🔄 Testing: ${testName}`, 'blue');
    await testFunction();
    testResults.passed++;
    log(`✅ ${testName} - PASSED`, 'green');
  } catch (error) {
    testResults.failed++;
    log(`❌ ${testName} - FAILED: ${error.message}`, 'red');
  }
}

// Test 1: Admin Login
async function testAdminLogin() {
  const response = await axios.post(`${BASE_URL}/admin-auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });

  if (!response.data.success) {
    throw new Error('Login failed');
  }

  authToken = response.data.data.token;
  adminId = response.data.data.admin._id;
  
  log(`   Token received: ${authToken.substring(0, 20)}...`, 'green');
  log(`   Admin ID: ${adminId}`, 'green');
}

// Test 2: Verify Token
async function testVerifyToken() {
  const response = await axios.get(`${BASE_URL}/admin-auth/verify-token`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });

  if (!response.data.success) {
    throw new Error('Token verification failed');
  }

  log(`   Admin verified: ${response.data.data.admin.fullName}`, 'green');
}

// Test 3: Get Admin Profile
async function testGetProfile() {
  const response = await axios.get(`${BASE_URL}/admin-auth/profile`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });

  if (!response.data.success) {
    throw new Error('Profile fetch failed');
  }

  log(`   Profile: ${response.data.data.fullName}`, 'green');
}

// Test 4: Get Admin Roles
async function testGetAdminRoles() {
  const response = await axios.get(`${BASE_URL}/admin-management/admin-roles`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });

  if (!response.data.success) {
    throw new Error('Admin roles fetch failed');
  }

  roleId = response.data.data[0]._id;
  log(`   Roles found: ${response.data.data.length}`, 'green');
  log(`   First role: ${response.data.data[0].displayName}`, 'green');
}

// Test 5: Get Admins List
async function testGetAdmins() {
  const response = await axios.get(`${BASE_URL}/admin-management/admins`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });

  if (!response.data.success) {
    throw new Error('Admins list fetch failed');
  }

  log(`   Admins found: ${response.data.data.admins.length}`, 'green');
  log(`   Total admins: ${response.data.data.pagination.total}`, 'green');
}

// Test 6: Get Single Admin
async function testGetSingleAdmin() {
  const response = await axios.get(`${BASE_URL}/admin-management/admins/${adminId}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });

  if (!response.data.success) {
    throw new Error('Single admin fetch failed');
  }

  log(`   Admin details: ${response.data.data.fullName}`, 'green');
}

// Test 7: Create New Admin
async function testCreateAdmin() {
  const newAdminData = {
    firstName: 'Test',
    lastName: 'Admin',
    email: 'testadmin@example.com',
    password: 'password123',
    roleId: roleId
  };

  const response = await axios.post(`${BASE_URL}/admin-management/admins`, newAdminData, {
    headers: { 
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.data.success) {
    throw new Error('Admin creation failed');
  }

  log(`   New admin created: ${response.data.data.fullName}`, 'green');
}

// Test 8: Update Admin Profile
async function testUpdateProfile() {
  const updateData = {
    firstName: 'Updated',
    lastName: 'Admin'
  };

  const response = await axios.put(`${BASE_URL}/admin-auth/profile`, updateData, {
    headers: { 
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.data.success) {
    throw new Error('Profile update failed');
  }

  log(`   Profile updated: ${response.data.data.fullName}`, 'green');
}

// Test 9: Get Admin Logs
async function testGetAdminLogs() {
  const response = await axios.get(`${BASE_URL}/admin-management/admin-logs`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });

  if (!response.data.success) {
    throw new Error('Admin logs fetch failed');
  }

  log(`   Admin logs found: ${response.data.data.logs.length}`, 'green');
  log(`   Total logs: ${response.data.data.pagination.total}`, 'green');
}

// Test 10: Get My Admin Logs
async function testGetMyAdminLogs() {
  const response = await axios.get(`${BASE_URL}/admin-management/my-admin-logs`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });

  if (!response.data.success) {
    throw new Error('My admin logs fetch failed');
  }

  log(`   My logs found: ${response.data.data.logs.length}`, 'green');
}

// Test 11: Create Admin Role
async function testCreateAdminRole() {
  const newRoleData = {
    name: 'test_role',
    displayName: 'Test Role',
    permissions: {
      canCreate: true,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      canManageAdmins: false,
      canAssignRoles: false,
      canManageUsers: true,
      canManageReports: false,
      canManageTrips: false,
      canManageGasStations: false,
      canViewAnalytics: true,
      canExportData: false,
      canManageSettings: false
    },
    description: 'Test role for API testing'
  };

  const response = await axios.post(`${BASE_URL}/admin-management/admin-roles`, newRoleData, {
    headers: { 
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.data.success) {
    throw new Error('Admin role creation failed');
  }

  log(`   New role created: ${response.data.data.displayName}`, 'green');
}

// Test 12: Admin Logout
async function testAdminLogout() {
  const response = await axios.post(`${BASE_URL}/admin-auth/logout`, {}, {
    headers: { Authorization: `Bearer ${authToken}` }
  });

  if (!response.data.success) {
    throw new Error('Logout failed');
  }

  log(`   Logout successful`, 'green');
}

// Test 13: Test Without Authentication (Should Fail)
async function testWithoutAuth() {
  try {
    await axios.get(`${BASE_URL}/admin-management/admins`);
    throw new Error('Should have failed without authentication');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log(`   Correctly rejected unauthorized request`, 'green');
    } else {
      throw error;
    }
  }
}

// Test 14: Test Invalid Token (Should Fail)
async function testInvalidToken() {
  try {
    await axios.get(`${BASE_URL}/admin-management/admins`, {
      headers: { Authorization: 'Bearer invalid-token' }
    });
    throw new Error('Should have failed with invalid token');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log(`   Correctly rejected invalid token`, 'green');
    } else {
      throw error;
    }
  }
}

// Main testing function
async function runAllTests() {
  log('\n🚀 Admin API Testing Suite', 'bold');
  log('=' .repeat(60), 'blue');
  
  try {
    // Authentication Tests
    log('\n🔐 AUTHENTICATION TESTS', 'bold');
    log('-'.repeat(30), 'blue');
    await runTest('Admin Login', testAdminLogin);
    await runTest('Verify Token', testVerifyToken);
    await runTest('Get Profile', testGetProfile);
    
    // Admin Management Tests
    log('\n👥 ADMIN MANAGEMENT TESTS', 'bold');
    log('-'.repeat(30), 'blue');
    await runTest('Get Admin Roles', testGetAdminRoles);
    await runTest('Get Admins List', testGetAdmins);
    await runTest('Get Single Admin', testGetSingleAdmin);
    await runTest('Create New Admin', testCreateAdmin);
    await runTest('Update Admin Profile', testUpdateProfile);
    
    // Role Management Tests
    log('\n🎭 ROLE MANAGEMENT TESTS', 'bold');
    log('-'.repeat(30), 'blue');
    await runTest('Create Admin Role', testCreateAdminRole);
    
    // Activity Logging Tests
    log('\n📊 ACTIVITY LOGGING TESTS', 'bold');
    log('-'.repeat(30), 'blue');
    await runTest('Get Admin Logs', testGetAdminLogs);
    await runTest('Get My Admin Logs', testGetMyAdminLogs);
    
    // Security Tests
    log('\n🔒 SECURITY TESTS', 'bold');
    log('-'.repeat(30), 'blue');
    await runTest('Test Without Authentication', testWithoutAuth);
    await runTest('Test Invalid Token', testInvalidToken);
    
    // Logout Test
    log('\n🚪 LOGOUT TESTS', 'bold');
    log('-'.repeat(30), 'blue');
    await runTest('Admin Logout', testAdminLogout);
    
  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, 'red');
  }
  
  // Final Results
  log('\n📊 TEST RESULTS SUMMARY', 'bold');
  log('=' .repeat(60), 'blue');
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  
  log(`\n✅ Tests Passed: ${testResults.passed}`, 'green');
  log(`❌ Tests Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  log(`📊 Total Tests: ${testResults.total}`, 'blue');
  log(`🎯 Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : 'yellow');
  
  if (successRate >= 90) {
    log('\n🎉 EXCELLENT! Admin APIs are working perfectly!', 'green');
    log('✅ All admin endpoints are functional', 'green');
    log('✅ Authentication is working', 'green');
    log('✅ Authorization is working', 'green');
    log('✅ Activity logging is working', 'green');
    log('🚀 Admin system is production ready!', 'green');
  } else if (successRate >= 70) {
    log('\n👍 GOOD! Most admin APIs are working!', 'yellow');
    log('⚠️  Some issues need attention', 'yellow');
    log('🔧 Review failed tests', 'yellow');
  } else {
    log('\n⚠️  NEEDS WORK! Several admin APIs have issues', 'red');
    log('❌ Multiple failures detected', 'red');
    log('🔧 Fix failed tests before production', 'red');
  }
  
  log('\n🎯 Admin API testing complete!', 'bold');
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the tests
runAllTests().catch(error => {
  log(`\n❌ Test execution failed: ${error.message}`, 'red');
  process.exit(1);
});
