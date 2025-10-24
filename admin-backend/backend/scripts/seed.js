const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Seed admin roles
const seedAdminRoles = async () => {
  try {
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
    console.log('✅ Admin roles seeded');
  } catch (error) {
    console.error('❌ Error seeding admin roles:', error);
  }
};

// Seed admin users
const seedAdmins = async () => {
  try {
    const superAdminRole = await AdminRole.findOne({ name: 'super_admin' });
    const adminRole = await AdminRole.findOne({ name: 'admin' });

    const admins = [
      {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@trafficmanagement.com',
        password: 'superadmin123',
        role: superAdminRole._id,
        isActive: true,
        isVerified: true,
        employeeId: 'SA001'
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@trafficmanagement.com',
        password: 'admin123',
        role: adminRole._id,
        isActive: true,
        isVerified: true,
        employeeId: 'AD001'
      }
    ];

    await Admin.insertMany(admins);
    console.log('✅ Admin users seeded');
  } catch (error) {
    console.error('❌ Error seeding admin users:', error);
  }
};

// Seed regular users
const seedUsers = async () => {
  try {
    const users = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+1234567890',
        address: {
          street: '123 Main Street',
          barangay: 'Barangay 1',
          city: 'Manila',
          province: 'Metro Manila',
          zipCode: '1000',
          coordinates: {
            lat: 14.5995,
            lng: 120.9842
          }
        },
        isActive: true,
        isVerified: true
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password123',
        phone: '+1234567891',
        address: {
          street: '456 Oak Avenue',
          barangay: 'Barangay 2',
          city: 'Quezon City',
          province: 'Metro Manila',
          zipCode: '1100',
          coordinates: {
            lat: 14.6760,
            lng: 121.0437
          }
        },
        isActive: true,
        isVerified: true
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike@example.com',
        password: 'password123',
        phone: '+1234567892',
        address: {
          street: '789 Pine Street',
          barangay: 'Barangay 3',
          city: 'Makati',
          province: 'Metro Manila',
          zipCode: '1200',
          coordinates: {
            lat: 14.5547,
            lng: 121.0244
          }
        },
        isActive: true,
        isVerified: true
      }
    ];

    await User.insertMany(users);
    console.log('✅ Regular users seeded');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
};

// Seed motorcycles
const seedMotorcycles = async () => {
  try {
    const users = await User.find();
    const motorcycles = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      motorcycles.push({
        owner: user._id,
        make: 'Honda',
        model: 'Wave 110',
        year: 2020,
        plateNumber: `ABC-${1000 + i}`,
        engineNumber: `ENG${1000 + i}`,
        chassisNumber: `CHS${1000 + i}`,
        engine: {
          displacement: 110,
          type: '4-stroke',
          fuelType: 'gasoline'
        },
        dimensions: {
          length: 190,
          width: 70,
          height: 110,
          weight: 100
        },
        performance: {
          topSpeed: 80,
          fuelCapacity: 4.5,
          fuelEfficiency: {
            city: 45,
            highway: 50,
            combined: 47
          }
        },
        color: {
          primary: 'Red',
          secondary: 'Black'
        },
        registration: {
          number: `REG${1000 + i}`,
          issueDate: new Date('2020-01-01'),
          expiryDate: new Date('2025-01-01'),
          issuingAuthority: 'LTO',
          status: 'active'
        },
        status: 'active'
      });
    }

    await Motorcycle.insertMany(motorcycles);
    console.log('✅ Motorcycles seeded');
  } catch (error) {
    console.error('❌ Error seeding motorcycles:', error);
  }
};

// Seed gas stations
const seedGasStations = async () => {
  try {
    const gasStations = [
      {
        name: 'Shell Station EDSA',
        brand: 'Shell',
        location: {
          address: 'EDSA, Quezon City',
          barangay: 'Barangay 1',
          city: 'Quezon City',
          province: 'Metro Manila',
          coordinates: {
            lat: 14.6760,
            lng: 121.0437
          }
        },
        contact: {
          phone: '+1234567890',
          email: 'edsa@shell.com'
        },
        operatingHours: {
          monday: { open: '06:00', close: '22:00', is24Hours: false },
          tuesday: { open: '06:00', close: '22:00', is24Hours: false },
          wednesday: { open: '06:00', close: '22:00', is24Hours: false },
          thursday: { open: '06:00', close: '22:00', is24Hours: false },
          friday: { open: '06:00', close: '22:00', is24Hours: false },
          saturday: { open: '06:00', close: '22:00', is24Hours: false },
          sunday: { open: '06:00', close: '22:00', is24Hours: false }
        },
        fuelPrices: {
          gasoline: {
            regular: 45.50,
            premium: 48.00
          },
          diesel: {
            regular: 42.00
          }
        },
        services: {
          fuel: {
            gasoline: true,
            diesel: true
          },
          convenience: {
            store: true,
            atm: true,
            restroom: true,
            carWash: false,
            airPump: true
          }
        },
        status: 'active',
        isVerified: true
      },
      {
        name: 'Petron Station Makati',
        brand: 'Petron',
        location: {
          address: 'Ayala Avenue, Makati',
          barangay: 'Barangay 2',
          city: 'Makati',
          province: 'Metro Manila',
          coordinates: {
            lat: 14.5547,
            lng: 121.0244
          }
        },
        contact: {
          phone: '+1234567891',
          email: 'makati@petron.com'
        },
        operatingHours: {
          monday: { open: '05:00', close: '23:00', is24Hours: false },
          tuesday: { open: '05:00', close: '23:00', is24Hours: false },
          wednesday: { open: '05:00', close: '23:00', is24Hours: false },
          thursday: { open: '05:00', close: '23:00', is24Hours: false },
          friday: { open: '05:00', close: '23:00', is24Hours: false },
          saturday: { open: '05:00', close: '23:00', is24Hours: false },
          sunday: { open: '05:00', close: '23:00', is24Hours: false }
        },
        fuelPrices: {
          gasoline: {
            regular: 46.00,
            premium: 48.50
          },
          diesel: {
            regular: 42.50
          }
        },
        services: {
          fuel: {
            gasoline: true,
            diesel: true
          },
          convenience: {
            store: true,
            atm: true,
            restroom: true,
            carWash: true,
            airPump: true
          }
        },
        status: 'active',
        isVerified: true
      }
    ];

    await GasStation.insertMany(gasStations);
    console.log('✅ Gas stations seeded');
  } catch (error) {
    console.error('❌ Error seeding gas stations:', error);
  }
};

// Seed reports
const seedReports = async () => {
  try {
    const users = await User.find();
    const reports = [];

    for (let i = 0; i < 10; i++) {
      const user = users[i % users.length];
      reports.push({
        reportType: ['Accident', 'Traffic Jam', 'Road Closure', 'Hazard'][i % 4],
        title: `Report ${i + 1}`,
        description: `Description for report ${i + 1}`,
        location: {
          address: `Location ${i + 1}`,
          barangay: 'Barangay 1',
          city: 'Manila',
          province: 'Metro Manila',
          coordinates: {
            lat: 14.5995 + (Math.random() - 0.5) * 0.1,
            lng: 120.9842 + (Math.random() - 0.5) * 0.1
          }
        },
        reporter: user._id,
        status: ['pending', 'verified', 'resolved'][i % 3],
        priority: ['low', 'medium', 'high'][i % 3],
        reportedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      });
    }

    await Report.insertMany(reports);
    console.log('✅ Reports seeded');
  } catch (error) {
    console.error('❌ Error seeding reports:', error);
  }
};

// Seed trips
const seedTrips = async () => {
  try {
    const users = await User.find();
    const motorcycles = await Motorcycle.find();
    const trips = [];

    for (let i = 0; i < 20; i++) {
      const user = users[i % users.length];
      const motorcycle = motorcycles[i % motorcycles.length];
      
      trips.push({
        user: user._id,
        motorcycle: motorcycle._id,
        title: `Trip ${i + 1}`,
        description: `Description for trip ${i + 1}`,
        startLocation: {
          address: `Start Location ${i + 1}`,
          coordinates: {
            lat: 14.5995 + (Math.random() - 0.5) * 0.1,
            lng: 120.9842 + (Math.random() - 0.5) * 0.1
          }
        },
        endLocation: {
          address: `End Location ${i + 1}`,
          coordinates: {
            lat: 14.5995 + (Math.random() - 0.5) * 0.1,
            lng: 120.9842 + (Math.random() - 0.5) * 0.1
          }
        },
        distance: Math.random() * 50 + 5,
        duration: Math.random() * 120 + 15,
        averageSpeed: Math.random() * 40 + 20,
        maxSpeed: Math.random() * 60 + 30,
        fuelConsumption: Math.random() * 5 + 1,
        fuelCost: Math.random() * 200 + 50,
        startTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: ['completed', 'cancelled', 'in-progress'][i % 3]
      });
    }

    await Trip.insertMany(trips);
    console.log('✅ Trips seeded');
  } catch (error) {
    console.error('❌ Error seeding trips:', error);
  }
};

// Main seed function
const seed = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await User.deleteMany({});
    await Admin.deleteMany({});
    await AdminRole.deleteMany({});
    await Report.deleteMany({});
    await Trip.deleteMany({});
    await GasStation.deleteMany({});
    await Motorcycle.deleteMany({});
    
    console.log('🗑️ Cleared existing data');
    
    // Seed data
    await seedAdminRoles();
    await seedAdmins();
    await seedUsers();
    await seedMotorcycles();
    await seedGasStations();
    await seedReports();
    await seedTrips();
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded data:');
    console.log('- Admin Roles: 3');
    console.log('- Admin Users: 2');
    console.log('- Regular Users: 3');
    console.log('- Motorcycles: 3');
    console.log('- Gas Stations: 2');
    console.log('- Reports: 10');
    console.log('- Trips: 20');
    
    console.log('\n🔑 Default admin credentials:');
    console.log('Super Admin: superadmin@trafficmanagement.com / superadmin123');
    console.log('Admin: admin@trafficmanagement.com / admin123');
    
    console.log('\n👤 Test user credentials:');
    console.log('User 1: john@example.com / password123');
    console.log('User 2: jane@example.com / password123');
    console.log('User 3: mike@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding
seed();
