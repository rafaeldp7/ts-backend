#!/usr/bin/env node

/**
 * 🧪 ADMIN LOGIN TEST
 * 
 * This script tests admin login specifically
 */

const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const AdminRole = require('./models/AdminRole');
const bcrypt = require('bcryptjs');

const testAdminLogin = async () => {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/trafficslight');
    console.log('✅ Connected to database');
    
    // Find admin account
    const admin = await Admin.findOne({ email: 'admin@trafficslight.com' }).populate('role');
    console.log('🔍 Admin found:', admin ? 'Yes' : 'No');
    
    if (admin) {
      console.log('📧 Email:', admin.email);
      console.log('🔐 Password hash:', admin.password);
      console.log('👤 Role:', admin.role ? admin.role.name : 'No role');
      console.log('✅ Active:', admin.isActive);
      
      // Test password
      const isPasswordValid = await admin.matchPassword('admin123');
      console.log('🔑 Password valid:', isPasswordValid);
      
      if (isPasswordValid) {
        console.log('✅ Admin login should work!');
      } else {
        console.log('❌ Password validation failed');
      }
    } else {
      console.log('❌ Admin account not found');
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testAdminLogin();
