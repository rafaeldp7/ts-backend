const mongoose = require('mongoose');
const AdminRole = require('../models/AdminRole');
require('dotenv').config();

const createDefaultRoles = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/traffic_slight', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to database');

    const defaultRoles = [
      {
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
        description: 'Full system access'
      },
      {
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
        description: 'Standard administrator access'
      },
      {
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
        description: 'Read-only access'
      }
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await AdminRole.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new AdminRole(roleData);
        await role.save();
        console.log(`✅ Created role: ${role.displayName}`);
      } else {
        console.log(`⚠️  Role already exists: ${roleData.displayName}`);
      }
    }

    console.log('✅ Default roles created successfully');
  } catch (error) {
    console.error('❌ Error creating default roles:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  createDefaultRoles();
}

module.exports = createDefaultRoles;
