const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const AdminRole = require('./models/AdminRole');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/trafficslight';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create default admin roles
const createDefaultRoles = async () => {
  try {
    // Check if roles already exist
    const existingRoles = await AdminRole.countDocuments();
    if (existingRoles > 0) {
      console.log('✅ Admin roles already exist');
      return;
    }

    // Create Super Admin role
    const superAdminRole = new AdminRole({
      name: 'super_admin',
      displayName: 'Super Administrator',
      description: 'Full system access with all permissions',
      permissions: [
        'admin.create', 'admin.read', 'admin.update', 'admin.delete',
        'role.create', 'role.read', 'role.update', 'role.delete',
        'user.create', 'user.read', 'user.update', 'user.delete',
        'report.create', 'report.read', 'report.update', 'report.delete',
        'trip.create', 'trip.read', 'trip.update', 'trip.delete',
        'analytics.read', 'settings.read', 'settings.update'
      ],
      level: 100,
      isActive: true,
      isSystem: true
    });

    // Create Admin role
    const adminRole = new AdminRole({
      name: 'admin',
      displayName: 'Administrator',
      description: 'Standard admin access',
      permissions: [
        'admin.read', 'admin.update',
        'user.read', 'user.update',
        'report.read', 'report.update',
        'trip.read', 'trip.update',
        'analytics.read'
      ],
      level: 50,
      isActive: true,
      isSystem: true
    });

    // Create Moderator role
    const moderatorRole = new AdminRole({
      name: 'moderator',
      displayName: 'Moderator',
      description: 'Limited admin access for content moderation',
      permissions: [
        'user.read',
        'report.read', 'report.update',
        'trip.read',
        'analytics.read'
      ],
      level: 25,
      isActive: true,
      isSystem: true
    });

    await Promise.all([
      superAdminRole.save(),
      adminRole.save(),
      moderatorRole.save()
    ]);

    console.log('✅ Default admin roles created');
  } catch (error) {
    console.error('❌ Error creating admin roles:', error);
  }
};

// Create default super admin
const createDefaultSuperAdmin = async () => {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ email: 'admin@trafficslight.com' });
    if (existingSuperAdmin) {
      console.log('✅ Super admin already exists');
      return;
    }

    // Get super admin role
    const superAdminRole = await AdminRole.findOne({ name: 'super_admin' });
    if (!superAdminRole) {
      console.error('❌ Super admin role not found');
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Create super admin
    const superAdmin = new Admin({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@trafficslight.com',
      password: hashedPassword,
      role: superAdminRole._id,
      isActive: true,
      isVerified: true,
      permissions: superAdminRole.permissions
    });

    await superAdmin.save();
    console.log('✅ Default super admin created');
    console.log('📧 Email: admin@trafficslight.com');
    console.log('🔑 Password: admin123');
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  }
};

// Main setup function
const setupAdminSystem = async () => {
  try {
    console.log('🚀 Setting up admin system...');
    
    await connectDB();
    await createDefaultRoles();
    await createDefaultSuperAdmin();
    
    console.log('✅ Admin system setup complete!');
    console.log('\n📋 Available admin endpoints:');
    console.log('POST /api/admin-auth/login - Admin login');
    console.log('POST /api/admin-auth/admin-login - Admin login (alternative)');
    console.log('GET /api/admin-management/ - Get all admins');
    console.log('GET /api/admin-management/roles - Get admin roles');
    console.log('GET /api/admin-management/stats - Get admin statistics');
    console.log('POST /api/admin-management/ - Create new admin');
    console.log('PUT /api/admin-management/:id - Update admin');
    console.log('DELETE /api/admin-management/:id - Delete admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
};

// Run setup
setupAdminSystem();