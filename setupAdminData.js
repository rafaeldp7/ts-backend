#!/usr/bin/env node

/**
 * Admin Data Setup Script
 * 
 * This script creates default admin roles and initial admin account.
 * Run with: node backend/scripts/setupAdminData.js
 */

const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const AdminRole = require('../models/AdminRole');
const AdminLog = require('../models/AdminLog');
require('dotenv').config();

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/traffic_slight');
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Create default admin roles
const createDefaultRoles = async () => {
  try {
    console.log('🔄 Creating default admin roles...');

    // Super Admin Role
    const superAdminRole = new AdminRole({
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
      description: 'Super Administrator with full system access',
      isActive: true
    });

    // Admin Role
    const adminRole = new AdminRole({
      name: 'admin',
      displayName: 'Administrator',
      permissions: {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: false,
        canManageAdmins: false,
        canAssignRoles: false,
        canManageUsers: true,
        canManageReports: true,
        canManageTrips: true,
        canManageGasStations: true,
        canViewAnalytics: true,
        canExportData: true,
        canManageSettings: false
      },
      description: 'Standard Administrator with most system access',
      isActive: true
    });

    // Viewer Role
    const viewerRole = new AdminRole({
      name: 'viewer',
      displayName: 'Viewer',
      permissions: {
        canCreate: false,
        canRead: true,
        canUpdate: false,
        canDelete: false,
        canManageAdmins: false,
        canAssignRoles: false,
        canManageUsers: false,
        canManageReports: false,
        canManageTrips: false,
        canManageGasStations: false,
        canViewAnalytics: true,
        canExportData: false,
        canManageSettings: false
      },
      description: 'Read-only access to system data',
      isActive: true
    });

    // Check if roles already exist
    const existingSuperAdmin = await AdminRole.findOne({ name: 'super_admin' });
    const existingAdmin = await AdminRole.findOne({ name: 'admin' });
    const existingViewer = await AdminRole.findOne({ name: 'viewer' });

    if (!existingSuperAdmin) {
      await superAdminRole.save();
      console.log('✅ Super Admin role created');
    } else {
      console.log('ℹ️  Super Admin role already exists');
    }

    if (!existingAdmin) {
      await adminRole.save();
      console.log('✅ Admin role created');
    } else {
      console.log('ℹ️  Admin role already exists');
    }

    if (!existingViewer) {
      await viewerRole.save();
      console.log('✅ Viewer role created');
    } else {
      console.log('ℹ️  Viewer role already exists');
    }

    return { superAdminRole, adminRole, viewerRole };
  } catch (error) {
    console.error('❌ Error creating admin roles:', error);
    throw error;
  }
};

// Create initial admin account
const createInitialAdmin = async (superAdminRole) => {
  try {
    console.log('🔄 Creating initial admin account...');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@trafficslight.com' });
    if (existingAdmin) {
      console.log('ℹ️  Initial admin account already exists');
      return existingAdmin;
    }

    const initialAdmin = new Admin({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@trafficslight.com',
      password: 'admin123', // Will be hashed by the model
      role: superAdminRole._id,
      isActive: true
    });

    await initialAdmin.save();
    console.log('✅ Initial admin account created');
    console.log('📧 Email: admin@trafficslight.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');

    return initialAdmin;
  } catch (error) {
    console.error('❌ Error creating initial admin:', error);
    throw error;
  }
};

// Create sample admin log
const createSampleLog = async (admin) => {
  try {
    console.log('🔄 Creating sample admin log...');

    const sampleLog = new AdminLog({
      adminId: admin._id,
      adminName: admin.fullName,
      adminEmail: admin.email,
      action: 'LOGIN',
      resource: 'SYSTEM',
      resourceName: 'System Login',
      details: {
        description: 'Initial admin account setup completed'
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Admin Setup Script',
      sessionId: 'setup-script',
      severity: 'LOW',
      status: 'SUCCESS'
    });

    await sampleLog.save();
    console.log('✅ Sample admin log created');
  } catch (error) {
    console.error('❌ Error creating sample log:', error);
    // Don't throw error for log creation failure
  }
};

// Main setup function
const setupAdminData = async () => {
  try {
    console.log('🚀 Starting Admin Data Setup...');
    console.log('=' .repeat(50));

    // Connect to database
    await connectDB();

    // Create default roles
    const { superAdminRole } = await createDefaultRoles();

    // Create initial admin
    const admin = await createInitialAdmin(superAdminRole);

    // Create sample log
    await createSampleLog(admin);

    console.log('=' .repeat(50));
    console.log('🎉 Admin data setup completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('✅ 3 Admin roles created (super_admin, admin, viewer)');
    console.log('✅ Initial admin account created');
    console.log('✅ Sample admin log created');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('📧 Email: admin@trafficslight.com');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('⚠️  Important: Change the default password after first login!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run setup if called directly
if (require.main === module) {
  setupAdminData();
}

module.exports = { setupAdminData, createDefaultRoles, createInitialAdmin };
