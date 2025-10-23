const createDefaultRoles = require('./createDefaultRoles');
const createDefaultAdmin = require('./createDefaultAdmin');

const setupAdminSystem = async () => {
  console.log('🚀 Setting up admin system...');
  
  try {
    // Step 1: Create default roles
    console.log('\n📋 Step 1: Creating default roles...');
    await createDefaultRoles();
    
    // Step 2: Create default admin
    console.log('\n👤 Step 2: Creating default admin...');
    await createDefaultAdmin();
    
    console.log('\n✅ Admin system setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Start your backend server: npm start');
    console.log('2. Test admin login with: admin@trafficslight.com / admin123');
    console.log('3. Update the default admin password after first login');
    
  } catch (error) {
    console.error('❌ Error setting up admin system:', error);
  }
};

// Run if called directly
if (require.main === module) {
  setupAdminSystem();
}

module.exports = setupAdminSystem;
