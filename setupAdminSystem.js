require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AdminRole = require('./models/AdminRole');
const Admin = require('./models/Admin');

const setupAdminSystem = async () => {
  console.log('🚀 Setting up admin system with 3 simplified roles...');

  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trafficslight', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');

    // 1. Define the 3 simplified roles
    const roles = [
      {
        name: 'super_admin',
        displayName: 'Super Admin',
        level: 100,
        description: 'Full system access with all permissions',
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
        isActive: true,
        isSystem: true
      },
      {
        name: 'admin',
        displayName: 'Admin',
        level: 50,
        description: 'Standard administrative access with limited permissions',
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
        isActive: true,
        isSystem: true
      },
      {
        name: 'moderator',
        displayName: 'Moderator',
        level: 25,
        description: 'Content moderation and read-only access',
        permissions: {
          canCreate: false,
          canRead: true,
          canUpdate: true,
          canDelete: false,
          canManageAdmins: false,
          canAssignRoles: false,
          canManageUsers: false,
          canManageReports: true,
          canManageTrips: true,
          canManageGasStations: false,
          canViewAnalytics: true,
          canExportData: false,
          canManageSettings: false
        },
        isActive: true,
        isSystem: true
      }
    ];

    // 2. Create or update roles
    let rolesCreated = 0;
    for (const roleData of roles) {
      const existingRole = await AdminRole.findOne({ name: roleData.name });
      if (existingRole) {
        // Update existing role
        Object.assign(existingRole, roleData);
        await existingRole.save();
        console.log(`✅ Updated role: ${roleData.displayName}`);
      } else {
        await AdminRole.create(roleData);
        rolesCreated++;
        console.log(`✅ Created role: ${roleData.displayName}`);
      }
    }

    if (rolesCreated > 0) {
      console.log(`✅ Created ${rolesCreated} new admin roles.`);
    } else {
      console.log('✅ All admin roles already exist and updated');
    }

    // 3. Create a default Super Admin account if it doesn't exist
    const superAdminRole = await AdminRole.findOne({ name: 'super_admin' });
    if (!superAdminRole) {
      console.error('❌ Super Admin role not found. Cannot create default super admin.');
      return;
    }

    const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@trafficslight.com';
    const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    const existingSuperAdmin = await Admin.findOne({ email: defaultAdminEmail });

    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash(defaultAdminPassword, 12);
      await Admin.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: defaultAdminEmail,
        password: hashedPassword,
        role: superAdminRole._id,
        isActive: true,
        isVerified: true,
        createdBy: null, // No one created the first super admin
      });
      console.log(`✅ Default Super Admin created with email: ${defaultAdminEmail}`);
    } else {
      console.log('✅ Super admin already exists');
    }

    console.log('✅ Admin system setup complete!');
    console.log('\n📋 Available admin roles:');
    console.log('1. Super Admin (Level 100) - Full system access');
    console.log('2. Admin (Level 50) - Standard administrative access');
    console.log('3. Moderator (Level 25) - Content moderation access');
    console.log('\n🔐 Default Super Admin Credentials:');
    console.log(`Email: ${defaultAdminEmail}`);
    console.log(`Password: ${defaultAdminPassword}`);

  } catch (error) {
    console.error('❌ Error setting up admin system:', error);
  } finally {
    mongoose.disconnect();
  }
};

setupAdminSystem();
