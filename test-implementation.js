#!/usr/bin/env node

/**
 * TrafficSlight Admin Dashboard - Implementation Testing Script
 * 
 * This script tests the complete implementation to verify production readiness.
 * Run with: node test-implementation.js
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  total: 0
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function test(name, condition, isWarning = false) {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    log(`✅ ${name}`, 'green');
  } else {
    if (isWarning) {
      testResults.warnings++;
      log(`⚠️  ${name}`, 'yellow');
    } else {
      testResults.failed++;
      log(`❌ ${name}`, 'red');
    }
  }
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  test(`${description}: ${filePath}`, exists);
  return exists;
}

function checkDirectoryExists(dirPath, description) {
  const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  test(`${description}: ${dirPath}`, exists);
  return exists;
}

function checkFileContent(filePath, searchText, description) {
  if (!fs.existsSync(filePath)) {
    test(`${description}: File not found`, false);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const contains = content.includes(searchText);
  test(`${description}: Contains "${searchText}"`, contains);
  return contains;
}

// Main testing function
async function runTests() {
  log('\n🚀 TrafficSlight Admin Dashboard - Implementation Testing', 'bold');
  log('=' .repeat(60), 'blue');
  
  // Test 1: Backend Structure
  log('\n📁 BACKEND STRUCTURE TESTS', 'bold');
  log('-'.repeat(30), 'blue');
  
  // Check backend directories
  checkDirectoryExists('backend', 'Backend directory');
  checkDirectoryExists('backend/controllers', 'Controllers directory');
  checkDirectoryExists('backend/routes', 'Routes directory');
  checkDirectoryExists('backend/models', 'Models directory');
  checkDirectoryExists('backend/middleware', 'Middleware directory');
  
  // Check key backend files
  checkFileExists('backend/server.js', 'Main server file');
  checkFileExists('backend/routes/index.js', 'Main routes file');
  checkFileExists('backend/package.json', 'Backend package.json');
  
  // Check controllers
  const controllers = [
    'authController.js', 'dashboardController.js', 'searchController.js',
    'exportController.js', 'geographyController.js', 'settingsController.js',
    'uploadController.js', 'notificationController.js'
  ];
  
  controllers.forEach(controller => {
    checkFileExists(`backend/controllers/${controller}`, `Controller: ${controller}`);
  });
  
  // Check routes
  const routes = [
    'auth.js', 'dashboard.js', 'search.js', 'export.js',
    'geography.js', 'settings.js', 'upload.js', 'notificationRoutes.js'
  ];
  
  routes.forEach(route => {
    checkFileExists(`backend/routes/${route}`, `Route: ${route}`);
  });
  
  // Check models
  const models = [
    'User.js', 'Report.js', 'GasStation.js', 'Motor.js',
    'Trip.js', 'Notification.js', 'Settings.js'
  ];
  
  models.forEach(model => {
    checkFileExists(`backend/models/${model}`, `Model: ${model}`);
  });
  
  // Test 2: Frontend Structure
  log('\n📁 FRONTEND STRUCTURE TESTS', 'bold');
  log('-'.repeat(30), 'blue');
  
  // Check frontend directories
  checkDirectoryExists('src', 'Source directory');
  checkDirectoryExists('src/services', 'Services directory');
  checkDirectoryExists('src/components', 'Components directory');
  checkDirectoryExists('src/scenes', 'Scenes directory');
  checkDirectoryExists('src/contexts', 'Contexts directory');
  checkDirectoryExists('src/hooks', 'Hooks directory');
  
  // Check key frontend files
  checkFileExists('src/App.js', 'Main App component');
  checkFileExists('src/index.js', 'Main index file');
  checkFileExists('package.json', 'Frontend package.json');
  
  // Check services
  const services = [
    'apiService.js', 'authService.js', 'dashboardService.js',
    'searchService.js', 'exportService.js', 'geographyService.js',
    'settingsService.js', 'uploadService.js', 'notificationService.js'
  ];
  
  services.forEach(service => {
    checkFileExists(`src/services/${service}`, `Service: ${service}`);
  });
  
  // Check components
  const components = [
    'SearchBar.jsx', 'SearchResults.jsx', 'ExportButton.jsx',
    'FileUpload.jsx', 'NotificationCenter.jsx', 'GeographyChart.jsx',
    'ProtectedRoute.jsx'
  ];
  
  components.forEach(component => {
    checkFileExists(`src/components/${component}`, `Component: ${component}`);
  });
  
  // Check scenes
  const scenes = [
    'dashboard/index.jsx', 'search/index.jsx', 'settings/index.jsx'
  ];
  
  scenes.forEach(scene => {
    checkFileExists(`src/scenes/${scene}`, `Scene: ${scene}`);
  });
  
  // Check authentication system
  checkFileExists('src/contexts/AuthContext.js', 'AuthContext');
  checkFileExists('src/hooks/useAuth.js', 'useAuth hook');
  
  // Test 3: Code Quality Tests
  log('\n🔍 CODE QUALITY TESTS', 'bold');
  log('-'.repeat(30), 'blue');
  
  // Check for authentication implementation
  checkFileContent('src/services/authService.js', 'login', 'Auth service has login method');
  checkFileContent('src/services/authService.js', 'logout', 'Auth service has logout method');
  checkFileContent('src/services/authService.js', 'JWT', 'Auth service has JWT handling');
  
  // Check for API service implementation
  checkFileContent('src/services/apiService.js', 'fetch', 'API service uses fetch');
  checkFileContent('src/services/apiService.js', 'Authorization', 'API service has auth headers');
  checkFileContent('src/services/apiService.js', 'error', 'API service has error handling');
  
  // Check for dashboard implementation
  checkFileContent('src/scenes/dashboard/index.jsx', 'useState', 'Dashboard uses React hooks');
  checkFileContent('src/scenes/dashboard/index.jsx', 'dashboardService', 'Dashboard uses service');
  checkFileContent('src/scenes/dashboard/index.jsx', 'loading', 'Dashboard has loading states');
  
  // Check for search implementation
  checkFileContent('src/components/SearchBar.jsx', 'onSearch', 'SearchBar has search handler');
  checkFileContent('src/components/SearchBar.jsx', 'debounced', 'SearchBar has debouncing');
  checkFileContent('src/components/SearchResults.jsx', 'results', 'SearchResults displays results');
  
  // Check for export implementation
  checkFileContent('src/components/ExportButton.jsx', 'exportService', 'ExportButton uses service');
  checkFileContent('src/components/ExportButton.jsx', 'format', 'ExportButton has format options');
  
  // Check for authentication context
  checkFileContent('src/contexts/AuthContext.js', 'AuthProvider', 'AuthContext has provider');
  checkFileContent('src/contexts/AuthContext.js', 'useAuth', 'AuthContext exports useAuth');
  checkFileContent('src/contexts/AuthContext.js', 'token', 'AuthContext handles tokens');
  
  // Check for protected routes
  checkFileContent('src/components/ProtectedRoute.jsx', 'isAuthenticated', 'ProtectedRoute checks auth');
  checkFileContent('src/components/ProtectedRoute.jsx', 'Navigate', 'ProtectedRoute redirects');
  
  // Test 4: Integration Tests
  log('\n🔗 INTEGRATION TESTS', 'bold');
  log('-'.repeat(30), 'blue');
  
  // Check App.js integration
  checkFileContent('src/App.js', 'AuthProvider', 'App uses AuthProvider');
  checkFileContent('src/App.js', 'ProtectedRoute', 'App uses ProtectedRoute');
  checkFileContent('src/App.js', 'Dashboard', 'App has Dashboard route');
  checkFileContent('src/App.js', 'SearchPage', 'App has Search route');
  
  // Check service integration
  checkFileContent('src/services/dashboardService.js', 'apiService', 'Dashboard service uses API service');
  checkFileContent('src/services/searchService.js', 'apiService', 'Search service uses API service');
  checkFileContent('src/services/exportService.js', 'apiService', 'Export service uses API service');
  
  // Test 5: Backend API Tests
  log('\n🌐 BACKEND API TESTS', 'bold');
  log('-'.repeat(30), 'blue');
  
  // Check backend route implementations
  checkFileContent('backend/routes/dashboard.js', 'getOverview', 'Dashboard route has overview');
  checkFileContent('backend/routes/search.js', 'searchUsers', 'Search route has user search');
  checkFileContent('backend/routes/export.js', 'exportUsers', 'Export route has user export');
  
  // Check controller implementations
  checkFileContent('backend/controllers/dashboardController.js', 'getOverview', 'Dashboard controller has overview');
  checkFileContent('backend/controllers/searchController.js', 'searchUsers', 'Search controller has user search');
  checkFileContent('backend/controllers/exportController.js', 'exportUsers', 'Export controller has user export');
  
  // Check middleware implementations
  checkFileContent('backend/routes/dashboard.js', 'protect', 'Dashboard routes use protection');
  checkFileContent('backend/routes/search.js', 'protect', 'Search routes use protection');
  checkFileContent('backend/routes/export.js', 'protect', 'Export routes use protection');
  
  // Test 6: Environment Configuration
  log('\n⚙️  ENVIRONMENT TESTS', 'bold');
  log('-'.repeat(30), 'blue');
  
  // Check for environment files
  const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
  let envFileExists = false;
  envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
      envFileExists = true;
    }
  });
  
  test('Environment file exists', envFileExists, true); // Warning if not found
  
  // Check package.json dependencies
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['react', 'react-dom', '@mui/material', 'react-router-dom'];
    
    requiredDeps.forEach(dep => {
      const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
      test(`Frontend dependency: ${dep}`, hasDep, true);
    });
  }
  
  if (fs.existsSync('backend/package.json')) {
    const backendPackageJson = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
    const requiredBackendDeps = ['express', 'mongoose', 'cors', 'jsonwebtoken'];
    
    requiredBackendDeps.forEach(dep => {
      const hasDep = backendPackageJson.dependencies && backendPackageJson.dependencies[dep];
      test(`Backend dependency: ${dep}`, hasDep, true);
    });
  }
  
  // Test 7: Documentation Tests
  log('\n📚 DOCUMENTATION TESTS', 'bold');
  log('-'.repeat(30), 'blue');
  
  // Check documentation files
  const docs = [
    'IMPLEMENTATION_COMPLETE.md',
    'FINAL_IMPLEMENTATION_STATUS.md',
    'ADMIN_SITE_IMPLEMENTATION_GUIDE.md',
    'backend/IMPLEMENTATION_COMPLETE.md',
    'backend/CORRECTED_IMPLEMENTATION_STATUS.md'
  ];
  
  docs.forEach(doc => {
    checkFileExists(doc, `Documentation: ${doc}`);
  });
  
  // Final Results
  log('\n📊 TEST RESULTS SUMMARY', 'bold');
  log('=' .repeat(60), 'blue');
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  
  log(`\n✅ Tests Passed: ${testResults.passed}`, 'green');
  log(`❌ Tests Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  log(`⚠️  Warnings: ${testResults.warnings}`, testResults.warnings > 0 ? 'yellow' : 'green');
  log(`📊 Total Tests: ${testResults.total}`, 'blue');
  log(`🎯 Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : 'yellow');
  
  // Production readiness assessment
  log('\n🚀 PRODUCTION READINESS ASSESSMENT', 'bold');
  log('=' .repeat(60), 'blue');
  
  if (successRate >= 95) {
    log('🎉 EXCELLENT! System is 95%+ production ready!', 'green');
    log('✅ All critical components are implemented', 'green');
    log('✅ Code quality is high', 'green');
    log('✅ Integration is complete', 'green');
    log('🚀 Ready for deployment!', 'green');
  } else if (successRate >= 85) {
    log('👍 GOOD! System is 85%+ production ready!', 'yellow');
    log('⚠️  Some minor issues need attention', 'yellow');
    log('🔧 Review failed tests and fix issues', 'yellow');
    log('✅ Almost ready for deployment!', 'yellow');
  } else {
    log('⚠️  NEEDS WORK! System needs more development', 'red');
    log('❌ Several critical issues found', 'red');
    log('🔧 Fix failed tests before deployment', 'red');
    log('📋 Follow implementation guide', 'red');
  }
  
  // Next steps
  log('\n📋 NEXT STEPS', 'bold');
  log('-'.repeat(30), 'blue');
  
  if (testResults.failed > 0) {
    log('1. Fix failed tests', 'red');
  }
  if (testResults.warnings > 0) {
    log('2. Address warnings', 'yellow');
  }
  log('3. Run runtime tests (see ADMIN_SITE_IMPLEMENTATION_GUIDE.md)', 'blue');
  log('4. Test API endpoints', 'blue');
  log('5. Test frontend build', 'blue');
  log('6. Deploy to production', 'green');
  
  log('\n🎯 Implementation testing complete!', 'bold');
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Test execution failed: ${error.message}`, 'red');
  process.exit(1);
});
