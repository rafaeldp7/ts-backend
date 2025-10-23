#!/usr/bin/env node

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ts-backend-1-jyit.onrender.com/api';

async function testAdminSystem() {
  console.log('🧪 Testing admin system...\n');
  
  try {
    // Test 1: Admin login
    console.log('📋 Test 1: Admin login...');
    const loginResponse = await fetch(`${API_BASE_URL}/admin-auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@trafficslight.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      console.log('✅ Admin login successful');
      const token = loginData.data.token;
      
      // Test 2: Get admin profile
      console.log('📋 Test 2: Get admin profile...');
      const profileResponse = await fetch(`${API_BASE_URL}/admin-auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const profileData = await profileResponse.json();
      
      if (profileData.success) {
        console.log('✅ Admin profile retrieved');
        console.log(`   Admin: ${profileData.data.firstName} ${profileData.data.lastName}`);
        console.log(`   Role: ${profileData.data.role.displayName}`);
      } else {
        console.log('❌ Failed to get admin profile');
      }
      
      // Test 3: Get admin list
      console.log('📋 Test 3: Get admin list...');
      const adminsResponse = await fetch(`${API_BASE_URL}/admin-management/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const adminsData = await adminsResponse.json();
      
      if (adminsData.success) {
        console.log('✅ Admin list retrieved');
        console.log(`   Total admins: ${adminsData.data.pagination.total}`);
      } else {
        console.log('❌ Failed to get admin list');
      }
      
      // Test 4: Get system stats
      console.log('📋 Test 4: Get system stats...');
      const statsResponse = await fetch(`${API_BASE_URL}/admin-settings/system-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        console.log('✅ System stats retrieved');
        console.log(`   Total users: ${statsData.data.totalUsers}`);
        console.log(`   Total reports: ${statsData.data.totalReports}`);
      } else {
        console.log('❌ Failed to get system stats');
      }
      
    } else {
      console.log('❌ Admin login failed:', loginData.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminSystem();
