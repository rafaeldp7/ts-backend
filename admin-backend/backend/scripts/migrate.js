const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../../../models/User');
const Admin = require('../../../models/Admin');
const AdminRole = require('../../../models/AdminRole');
const Report = require('../../../models/Reports');
const Trip = require('../../../models/TripModel');
const GasStation = require('../../../models/GasStation');
const Motorcycle = require('../../../models/motorcycleModel');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/traffic-management');
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Create indexes
const createIndexes = async () => {
  try {
    console.log('🔧 Creating database indexes...');
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ 'address.city': 1 });
    await User.collection.createIndex({ 'address.barangay': 1 });
    await User.collection.createIndex({ createdAt: -1 });
    await User.collection.createIndex({ isActive: 1 });
    console.log('✅ User indexes created');

    // Admin indexes
    await Admin.collection.createIndex({ email: 1 }, { unique: true });
    await Admin.collection.createIndex({ role: 1 });
    await Admin.collection.createIndex({ isActive: 1 });
    await Admin.collection.createIndex({ createdAt: -1 });
    console.log('✅ Admin indexes created');

    // AdminRole indexes
    await AdminRole.collection.createIndex({ name: 1 }, { unique: true });
    await AdminRole.collection.createIndex({ isActive: 1 });
    await AdminRole.collection.createIndex({ level: 1 });
    console.log('✅ AdminRole indexes created');

    // Report indexes
    await Report.collection.createIndex({ reportType: 1 });
    await Report.collection.createIndex({ status: 1 });
    await Report.collection.createIndex({ priority: 1 });
    await Report.collection.createIndex({ 'location.coordinates': '2dsphere' });
    await Report.collection.createIndex({ reporter: 1 });
    await Report.collection.createIndex({ verifiedBy: 1 });
    await Report.collection.createIndex({ reportedAt: -1 });
    await Report.collection.createIndex({ tags: 1 });
    await Report.collection.createIndex({ category: 1 });
    console.log('✅ Report indexes created');

    // Trip indexes
    await Trip.collection.createIndex({ user: 1 });
    await Trip.collection.createIndex({ motorcycle: 1 });
    await Trip.collection.createIndex({ status: 1 });
    await Trip.collection.createIndex({ startTime: -1 });
    await Trip.collection.createIndex({ endTime: -1 });
    await Trip.collection.createIndex({ 'startLocation.coordinates': '2dsphere' });
    await Trip.collection.createIndex({ 'endLocation.coordinates': '2dsphere' });
    await Trip.collection.createIndex({ tags: 1 });
    await Trip.collection.createIndex({ isPublic: 1 });
    await Trip.collection.createIndex({ isArchived: 1 });
    console.log('✅ Trip indexes created');

    // GasStation indexes
    await GasStation.collection.createIndex({ name: 1 });
    await GasStation.collection.createIndex({ brand: 1 });
    await GasStation.collection.createIndex({ 'location.coordinates': '2dsphere' });
    await GasStation.collection.createIndex({ 'location.city': 1 });
    await GasStation.collection.createIndex({ 'location.barangay': 1 });
    await GasStation.collection.createIndex({ status: 1 });
    await GasStation.collection.createIndex({ isVerified: 1 });
    await GasStation.collection.createIndex({ 'stats.averageRating': -1 });
    await GasStation.collection.createIndex({ isArchived: 1 });
    console.log('✅ GasStation indexes created');

    // Motorcycle indexes
    await Motorcycle.collection.createIndex({ owner: 1 });
    await Motorcycle.collection.createIndex({ plateNumber: 1 }, { unique: true });
    await Motorcycle.collection.createIndex({ make: 1, model: 1 });
    await Motorcycle.collection.createIndex({ year: 1 });
    await Motorcycle.collection.createIndex({ status: 1 });
    await Motorcycle.collection.createIndex({ 'registration.expiryDate': 1 });
    await Motorcycle.collection.createIndex({ 'insurance.endDate': 1 });
    await Motorcycle.collection.createIndex({ isArchived: 1 });
    console.log('✅ Motorcycle indexes created');

    console.log('✅ All indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
};

// Create default admin roles
const createDefaultRoles = async () => {
  try {
    console.log('🔧 Creating default admin roles...');
    
    const existingRoles = await AdminRole.countDocuments();
    if (existingRoles > 0) {
      console.log('✅ Admin roles already exist');
      return;
    }

    const roles = [
      {
        name: 'super_admin',
        displayName: 'Super Administrator',
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
        level: 10,
        isSystem: true
      },
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Administrative access with most permissions',
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
        level: 5,
        isSystem: true
      },
      {
        name: 'viewer',
        displayName: 'Viewer',
        description: 'Read-only access to view data',
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
        level: 1,
        isSystem: true
      }
    ];

    await AdminRole.insertMany(roles);
    console.log('✅ Default admin roles created');
  } catch (error) {
    console.error('❌ Error creating default roles:', error);
    throw error;
  }
};

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    console.log('🔧 Creating default admin user...');
    
    const existingAdmin = await Admin.findOne({ email: 'admin@trafficmanagement.com' });
    if (existingAdmin) {
      console.log('✅ Default admin user already exists');
      return;
    }

    const superAdminRole = await AdminRole.findOne({ name: 'super_admin' });
    if (!superAdminRole) {
      throw new Error('Super admin role not found');
    }

    const admin = new Admin({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@trafficmanagement.com',
      password: 'admin123',
      role: superAdminRole._id,
      isActive: true,
      isVerified: true,
      employeeId: 'SA001'
    });

    await admin.save();
    console.log('✅ Default admin user created');
    console.log('🔑 Admin credentials: admin@trafficmanagement.com / admin123');
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
    throw error;
  }
};

// Update existing data
const updateExistingData = async () => {
  try {
    console.log('🔧 Updating existing data...');
    
    // Update users with missing fields
    await User.updateMany(
      { preferences: { $exists: false } },
      {
        $set: {
          preferences: {
            notifications: {
              email: true,
              push: true,
              sms: false
            },
            theme: 'auto',
            language: 'en'
          }
        }
      }
    );
    console.log('✅ Updated user preferences');

    // Update reports with missing fields
    await Report.updateMany(
      { impact: { $exists: false } },
      {
        $set: {
          impact: {
            severity: 'moderate',
            affectedArea: 'local',
            estimatedDuration: 30,
            trafficImpact: 'moderate'
          }
        }
      }
    );
    console.log('✅ Updated report impact data');

    // Update trips with missing fields
    await Trip.updateMany(
      { weather: { $exists: false } },
      {
        $set: {
          weather: {
            condition: 'unknown'
          }
        }
      }
    );
    console.log('✅ Updated trip weather data');

    // Update gas stations with missing fields
    await GasStation.updateMany(
      { services: { $exists: false } },
      {
        $set: {
          services: {
            fuel: {
              gasoline: true,
              diesel: true,
              lpg: false
            },
            convenience: {
              store: false,
              atm: false,
              restroom: false,
              carWash: false,
              airPump: false
            }
          }
        }
      }
    );
    console.log('✅ Updated gas station services');

    console.log('✅ Existing data updated');
  } catch (error) {
    console.error('❌ Error updating existing data:', error);
    throw error;
  }
};

// Main migration function
const migrate = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Starting database migration...');
    
    // Create indexes
    await createIndexes();
    
    // Create default roles
    await createDefaultRoles();
    
    // Create default admin
    await createDefaultAdmin();
    
    // Update existing data
    await updateExistingData();
    
    console.log('✅ Database migration completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
migrate();
