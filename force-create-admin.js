#!/usr/bin/env node

/**
 * 🔧 FORCE CREATE ADMIN ACCOUNT
 * 
 * This script forcefully creates the admin account
 */

const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const AdminRole = require('./models/AdminRole');
const bcrypt = require('bcryptjs');

const forceCreateAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/trafficslight');
    console.log('✅ Connected to database');
    
    // Find or create super admin role
    let superAdminRole = await AdminRole.findOne({ name: 'super_admin' });
    if (!superAdminRole) {
      console.log('📋 Creating super admin role...');
      superAdminRole = new AdminRole({
        name: 'super_admin',
        displayName: 'Super Administrator',
        permissions: {
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
          canManageAdmins: true,
          canAssignRoles: true,
          canManageUsers: true,
          canManageReports: true,
          canManageTrips: true,
          canManageGasStations: true,
          canViewAnalytics: true,
          canExportData: true,
          canManageSettings: true
        },
        description: 'Full system access',
        isActive: true
      });
      await superAdminRole.save();
      console.log('✅ Super admin role created');
    } else {
      console.log('✅ Super admin role already exists');
    }
    
    // Delete existing admin if exists
    await Admin.deleteOne({ email: 'admin@trafficslight.com' });
    console.log('🗑️ Deleted existing admin account');
    
    // Create new admin account
    console.log('👤 Creating admin account...');
    const admin = new Admin({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@trafficslight.com',
      password: 'admin123', // Will be hashed by pre-save middleware
      role: superAdminRole._id,
      isActive: true,
      createdBy: null
    });
    
    await admin.save();
    console.log('✅ Admin account created successfully');
    
    // Verify the account
    const savedAdmin = await Admin.findOne({ email: 'admin@trafficslight.com' }).populate('role');
    console.log('🔍 Admin account verified:');
    console.log('📧 Email:', savedAdmin.email);
    console.log('👤 Name:', savedAdmin.fullName);
    console.log('🔐 Role:', savedAdmin.role.displayName);
    console.log('✅ Active:', savedAdmin.isActive);
    
    // Test password
    const isPasswordValid = await savedAdmin.matchPassword('admin123');
    console.log('🔑 Password test:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
};

forceCreateAdmin();
