import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('🚀 Starting admin user creation...');

  try {
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@gmail.com' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email: admin@gmail.com');
      console.log(`   User ID: ${existingAdmin.id}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Created: ${existingAdmin.createdAt}`);
      return existingAdmin;
    }

    // Hash password using bcrypt with 12 rounds (following existing patterns)
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        emailVerified: new Date(), // Mark as verified for immediate access
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📋 Admin User Details:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Email Verified: ${adminUser.emailVerified}`);
    console.log(`   Created: ${adminUser.createdAt}`);
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log(`   Email: admin@gmail.com`);
    console.log(`   Password: admin123`);
    console.log('');
    console.log('🎯 The admin user can now:');
    console.log('   - Access all admin dashboard routes');
    console.log('   - Manage events, users, and system settings');
    console.log('   - Approve organizer registrations');
    console.log('   - Manage banners and system configuration');
    console.log('   - Access all administrative functions');

    return adminUser;

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('');
    console.log('🎉 Admin user creation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to create admin user:', error);
    process.exit(1);
  });
