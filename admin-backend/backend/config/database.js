const mongoose = require('mongoose');

// Database configuration
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/traffic-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Set up connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📡 Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📡 Mongoose connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Database health check
const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      status: states[state] || 'unknown',
      readyState: state,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
};

// Database statistics
const getDatabaseStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
      objects: stats.objects,
      avgObjSize: stats.avgObjSize
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
};

// Create indexes for better performance
const createIndexes = async () => {
  try {
    const User = require('../models/User');
    const Admin = require('../models/Admin');
    const Report = require('../models/Report');
    const Trip = require('../models/Trip');
    const GasStation = require('../models/GasStation');
    const Notification = require('../models/Notification');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ 'address.city': 1 });
    await User.collection.createIndex({ 'address.barangay': 1 });
    await User.collection.createIndex({ createdAt: -1 });
    await User.collection.createIndex({ isActive: 1 });

    // Admin indexes
    await Admin.collection.createIndex({ email: 1 }, { unique: true });
    await Admin.collection.createIndex({ role: 1 });
    await Admin.collection.createIndex({ isActive: 1 });
    await Admin.collection.createIndex({ createdAt: -1 });

    // Report indexes
    await Report.collection.createIndex({ reportType: 1 });
    await Report.collection.createIndex({ status: 1 });
    await Report.collection.createIndex({ priority: 1 });
    await Report.collection.createIndex({ 'location.coordinates': '2dsphere' });
    await Report.collection.createIndex({ reporter: 1 });
    await Report.collection.createIndex({ reportedAt: -1 });
    await Report.collection.createIndex({ tags: 1 });

    // Trip indexes
    await Trip.collection.createIndex({ user: 1 });
    await Trip.collection.createIndex({ motorcycle: 1 });
    await Trip.collection.createIndex({ status: 1 });
    await Trip.collection.createIndex({ startTime: -1 });
    await Trip.collection.createIndex({ 'startLocation.coordinates': '2dsphere' });
    await Trip.collection.createIndex({ 'endLocation.coordinates': '2dsphere' });

    // Gas Station indexes
    await GasStation.collection.createIndex({ name: 1 });
    await GasStation.collection.createIndex({ brand: 1 });
    await GasStation.collection.createIndex({ 'location.coordinates': '2dsphere' });
    await GasStation.collection.createIndex({ 'location.city': 1 });
    await GasStation.collection.createIndex({ status: 1 });
    await GasStation.collection.createIndex({ isVerified: 1 });

    // Notification indexes
    await Notification.collection.createIndex({ recipient: 1 });
    await Notification.collection.createIndex({ type: 1 });
    await Notification.collection.createIndex({ status: 1 });
    await Notification.collection.createIndex({ createdAt: -1 });
    await Notification.collection.createIndex({ expiresAt: 1 });

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating database indexes:', error);
  }
};

// Seed initial data
const seedInitialData = async () => {
  try {
    const AdminRole = require('../models/AdminRole');
    
    // Check if roles already exist
    const existingRoles = await AdminRole.countDocuments();
    if (existingRoles > 0) {
      console.log('📊 Initial data already seeded');
      return;
    }

    // Create default admin roles
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
    console.log('✅ Initial admin roles created');

  } catch (error) {
    console.error('❌ Error seeding initial data:', error);
  }
};

module.exports = {
  connectDB,
  checkDatabaseHealth,
  getDatabaseStats,
  createIndexes,
  seedInitialData
};
