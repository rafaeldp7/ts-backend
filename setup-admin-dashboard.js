#!/usr/bin/env node

/**
 * TrafficSlight Admin Dashboard - Quick Setup Script
 * 
 * This script helps set up the admin dashboard quickly.
 * Run with: node setup-admin-dashboard.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function runCommand(command, description) {
  try {
    log(`🔄 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    return false;
  }
}

function createEnvFile() {
  const backendEnv = `# TrafficSlight Admin Dashboard - Backend Environment Variables
MONGODB_URI=mongodb://localhost:27017/traffic_slight
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
`;

  const frontendEnv = `# TrafficSlight Admin Dashboard - Frontend Environment Variables
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=http://localhost:5000
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_FILE_UPLOAD=true
REACT_APP_ENABLE_EXPORT=true
REACT_APP_THEME_MODE=dark
REACT_APP_PRIMARY_COLOR=#00ADB5
`;

  try {
    fs.writeFileSync('backend/.env', backendEnv);
    log('✅ Backend .env file created', 'green');
  } catch (error) {
    log('⚠️  Could not create backend .env file', 'yellow');
  }

  try {
    fs.writeFileSync('.env', frontendEnv);
    log('✅ Frontend .env file created', 'green');
  } catch (error) {
    log('⚠️  Could not create frontend .env file', 'yellow');
  }
}

function createUploadsDirectory() {
  const uploadsDir = 'backend/uploads';
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
      log('✅ Uploads directory created', 'green');
    } catch (error) {
      log('⚠️  Could not create uploads directory', 'yellow');
    }
  } else {
    log('✅ Uploads directory already exists', 'green');
  }
}

function checkDependencies() {
  log('\n📦 CHECKING DEPENDENCIES', 'bold');
  log('-'.repeat(30), 'blue');

  // Check if Node.js is installed
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' });
    log(`✅ Node.js version: ${nodeVersion.trim()}`, 'green');
  } catch (error) {
    log('❌ Node.js is not installed. Please install Node.js first.', 'red');
    return false;
  }

  // Check if npm is installed
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' });
    log(`✅ npm version: ${npmVersion.trim()}`, 'green');
  } catch (error) {
    log('❌ npm is not installed. Please install npm first.', 'red');
    return false;
  }

  return true;
}

function installBackendDependencies() {
  log('\n🔧 INSTALLING BACKEND DEPENDENCIES', 'bold');
  log('-'.repeat(30), 'blue');

  if (!fs.existsSync('backend/package.json')) {
    log('❌ Backend package.json not found', 'red');
    return false;
  }

  return runCommand('cd backend && npm install', 'Installing backend dependencies');
}

function installFrontendDependencies() {
  log('\n🔧 INSTALLING FRONTEND DEPENDENCIES', 'bold');
  log('-'.repeat(30), 'blue');

  if (!fs.existsSync('package.json')) {
    log('❌ Frontend package.json not found', 'red');
    return false;
  }

  // Install additional required packages
  const additionalPackages = [
    '@mui/material',
    '@emotion/react',
    '@emotion/styled',
    '@mui/icons-material',
    'react-chartjs-2',
    'chart.js',
    'react-router-dom',
    '@reduxjs/toolkit',
    'react-redux'
  ];

  const installCommand = `npm install ${additionalPackages.join(' ')}`;
  return runCommand(installCommand, 'Installing frontend dependencies');
}

function testBackend() {
  log('\n🧪 TESTING BACKEND', 'bold');
  log('-'.repeat(30), 'blue');

  // Check if backend can start (without actually starting it)
  try {
    const packageJson = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
    if (packageJson.scripts && packageJson.scripts.start) {
      log('✅ Backend start script found', 'green');
    } else {
      log('⚠️  Backend start script not found', 'yellow');
    }
  } catch (error) {
    log('❌ Could not read backend package.json', 'red');
    return false;
  }

  return true;
}

function testFrontend() {
  log('\n🧪 TESTING FRONTEND', 'bold');
  log('-'.repeat(30), 'blue');

  // Check if frontend can build
  return runCommand('npm run build', 'Testing frontend build');
}

function createStartScripts() {
  log('\n📝 CREATING START SCRIPTS', 'bold');
  log('-'.repeat(30), 'blue');

  const startBackendScript = `#!/bin/bash
echo "🚀 Starting TrafficSlight Admin Dashboard Backend..."
cd backend
npm start
`;

  const startFrontendScript = `#!/bin/bash
echo "🚀 Starting TrafficSlight Admin Dashboard Frontend..."
npm start
`;

  const startAllScript = `#!/bin/bash
echo "🚀 Starting TrafficSlight Admin Dashboard (Full Stack)..."
echo "Starting backend..."
cd backend && npm start &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"
echo "Waiting for backend to start..."
sleep 5
echo "Starting frontend..."
cd .. && npm start &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"
echo "Both services are running!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop both services"
wait
`;

  try {
    fs.writeFileSync('start-backend.sh', startBackendScript);
    fs.writeFileSync('start-frontend.sh', startFrontendScript);
    fs.writeFileSync('start-all.sh', startAllScript);
    
    // Make scripts executable on Unix systems
    try {
      execSync('chmod +x start-backend.sh start-frontend.sh start-all.sh');
    } catch (error) {
      // Ignore chmod errors on Windows
    }
    
    log('✅ Start scripts created', 'green');
    log('  - start-backend.sh: Start backend only', 'blue');
    log('  - start-frontend.sh: Start frontend only', 'blue');
    log('  - start-all.sh: Start both backend and frontend', 'blue');
  } catch (error) {
    log('⚠️  Could not create start scripts', 'yellow');
  }
}

function showNextSteps() {
  log('\n🎯 NEXT STEPS', 'bold');
  log('=' .repeat(60), 'blue');
  
  log('\n1. 📊 Run Implementation Test:', 'green');
  log('   node test-implementation.js', 'blue');
  
  log('\n2. 🗄️  Setup Database:', 'green');
  log('   - Install MongoDB locally or use MongoDB Atlas', 'blue');
  log('   - Update MONGODB_URI in backend/.env', 'blue');
  
  log('\n3. 🚀 Start the Application:', 'green');
  log('   - Backend: ./start-backend.sh or cd backend && npm start', 'blue');
  log('   - Frontend: ./start-frontend.sh or npm start', 'blue');
  log('   - Both: ./start-all.sh', 'blue');
  
  log('\n4. 🧪 Test the Application:', 'green');
  log('   - Backend: http://localhost:5000/health', 'blue');
  log('   - Frontend: http://localhost:3000', 'blue');
  
  log('\n5. 📚 Read Documentation:', 'green');
  log('   - ADMIN_SITE_IMPLEMENTATION_GUIDE.md', 'blue');
  log('   - IMPLEMENTATION_COMPLETE.md', 'blue');
  
  log('\n6. 🔧 Configure Production:', 'green');
  log('   - Update environment variables', 'blue');
  log('   - Set up production database', 'blue');
  log('   - Configure security settings', 'blue');
  
  log('\n🎉 Setup Complete! Your TrafficSlight Admin Dashboard is ready!', 'green');
}

// Main setup function
async function setup() {
  log('\n🚀 TrafficSlight Admin Dashboard - Quick Setup', 'bold');
  log('=' .repeat(60), 'blue');
  
  // Check dependencies
  if (!checkDependencies()) {
    log('\n❌ Setup failed: Missing dependencies', 'red');
    process.exit(1);
  }
  
  // Create environment files
  log('\n⚙️  CREATING ENVIRONMENT FILES', 'bold');
  log('-'.repeat(30), 'blue');
  createEnvFile();
  
  // Create uploads directory
  log('\n📁 CREATING UPLOADS DIRECTORY', 'bold');
  log('-'.repeat(30), 'blue');
  createUploadsDirectory();
  
  // Install dependencies
  const backendSuccess = installBackendDependencies();
  const frontendSuccess = installFrontendDependencies();
  
  if (!backendSuccess || !frontendSuccess) {
    log('\n⚠️  Some dependencies failed to install. Please check manually.', 'yellow');
  }
  
  // Test components
  testBackend();
  testFrontend();
  
  // Create start scripts
  createStartScripts();
  
  // Show next steps
  showNextSteps();
}

// Run setup
setup().catch(error => {
  log(`\n❌ Setup failed: ${error.message}`, 'red');
  process.exit(1);
});
