const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const AdminRole = require('./models/AdminRole');
require('dotenv').config();

const createDefaultAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/traffic_slight', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to database');

    // Check if default admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@trafficslight.com' });
    if (existingAdmin) {
      console.log('⚠️  Default admin already exists');
      return;
    }

    // Get super admin role
    const superAdminRole = await AdminRole.findOne({ name: 'super_admin' });
    if (!superAdminRole) {
      console.error('❌ Super admin role not found. Please create default roles first.');
      return;
    }

    // Create default admin
    const defaultAdmin = new Admin({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@trafficslight.com',
      password: 'admin123', // This will be hashed by the pre-save middleware
      role: superAdminRole._id,
      isActive: true,
      createdBy: null // System created
    });

    await defaultAdmin.save();
    console.log('✅ Default admin created successfully');
    console.log('📧 Email: admin@trafficslight.com');
    console.log('🔑 Password: admin123');
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  createDefaultAdmin();
}

module.exports = createDefaultAdmin;
