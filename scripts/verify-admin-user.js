import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verifyAdminUser() {
  console.log('🔍 Verifying admin user creation...');

  try {
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@gmail.com' }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return false;
    }

    console.log('✅ Admin user found in database');
    console.log('');
    console.log('📋 Verification Results:');
    console.log(`   ✓ User ID: ${adminUser.id}`);
    console.log(`   ✓ Name: ${adminUser.name} ${adminUser.name === 'Admin User' ? '✅' : '❌'}`);
    console.log(`   ✓ Email: ${adminUser.email} ${adminUser.email === 'admin@gmail.com' ? '✅' : '❌'}`);
    console.log(`   ✓ Role: ${adminUser.role} ${adminUser.role === UserRole.ADMIN ? '✅' : '❌'}`);
    console.log(`   ✓ Email Verified: ${adminUser.emailVerified ? '✅ Yes' : '❌ No'}`);
    console.log(`   ✓ Password Hash: ${adminUser.password ? '✅ Present' : '❌ Missing'}`);
    console.log(`   ✓ Created: ${adminUser.createdAt}`);
    console.log(`   ✓ Updated: ${adminUser.updatedAt}`);

    // Verify password hash
    if (adminUser.password) {
      const passwordValid = await bcrypt.compare('admin123', adminUser.password);
      console.log(`   ✓ Password Verification: ${passwordValid ? '✅ Valid' : '❌ Invalid'}`);
    }

    // Check if all requirements are met
    const isValid = 
      adminUser.name === 'Admin User' &&
      adminUser.email === 'admin@gmail.com' &&
      adminUser.role === UserRole.ADMIN &&
      adminUser.emailVerified &&
      adminUser.password;

    console.log('');
    if (isValid) {
      console.log('🎉 Admin user verification PASSED!');
      console.log('');
      console.log('🔑 Final Login Credentials:');
      console.log(`   Email: admin@gmail.com`);
      console.log(`   Password: admin123`);
      console.log('');
      console.log('🚀 The admin user is ready to use and can access:');
      console.log('   - Admin dashboard at /admin');
      console.log('   - All administrative functions');
      console.log('   - User management');
      console.log('   - Event approval system');
      console.log('   - Banner management');
      console.log('   - System configuration');
    } else {
      console.log('❌ Admin user verification FAILED!');
    }

    return isValid;

  } catch (error) {
    console.error('❌ Error verifying admin user:', error);
    return false;
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the verification
verifyAdminUser()
  .then((success) => {
    if (success) {
      console.log('');
      console.log('✅ Database reset and admin user creation completed successfully!');
      process.exit(0);
    } else {
      console.log('');
      console.log('❌ Verification failed!');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('💥 Verification script failed:', error);
    process.exit(1);
  });
