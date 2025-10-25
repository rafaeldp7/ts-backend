require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const setupAdminSystem = async () => {
  console.log('🚀 Setting up admin system with 3 simplified roles...');

  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trafficslight', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');

    // 1. Create a default Super Admin account if it doesn't exist

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
        role: 'super_admin',
        isActive: true,
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
