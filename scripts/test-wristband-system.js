import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testWristbandSystem() {
  try {
    console.log('🔍 Testing Wristband QR Code System...\n');

    // Test 1: Check if WristbandQRCode table exists
    console.log('1. Checking WristbandQRCode table...');
    const wristbandCount = await prisma.wristbandQRCode.count();
    console.log(`   ✅ WristbandQRCode table exists with ${wristbandCount} records\n`);

    // Test 2: Check if WristbandScanLog table exists
    console.log('2. Checking WristbandScanLog table...');
    const scanLogCount = await prisma.wristbandScanLog.count();
    console.log(`   ✅ WristbandScanLog table exists with ${scanLogCount} records\n`);

    // Test 3: Check organizers
    console.log('3. Checking organizers...');
    const organizers = await prisma.organizer.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        },
        events: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
      take: 3
    });

    if (organizers.length > 0) {
      console.log(`   ✅ Found ${organizers.length} organizers:`);
      organizers.forEach(org => {
        console.log(`      - ${org.orgName} (${org.user.email}) - ${org.events.length} events`);
      });
    } else {
      console.log('   ⚠️  No organizers found');
    }

    // Test 4: Check admin users
    console.log('\n4. Checking admin users...');
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (adminUsers.length > 0) {
      console.log(`   ✅ Found ${adminUsers.length} admin users:`);
      adminUsers.forEach(admin => {
        console.log(`      - ${admin.name} (${admin.email})`);
      });
    } else {
      console.log('   ⚠️  No admin users found');
    }

    console.log('\n🎉 Wristband system verification completed!');
    console.log('\n📋 Summary:');
    console.log(`   - WristbandQRCode records: ${wristbandCount}`);
    console.log(`   - WristbandScanLog records: ${scanLogCount}`);
    console.log(`   - Organizers: ${organizers.length}`);
    console.log(`   - Admin users: ${adminUsers.length}`);

    if (organizers.length > 0) {
      console.log('\n✅ System is ready for wristband creation!');
      console.log('   Organizers can now access: /organizer/[id]/wristbands');
    }

  } catch (error) {
    console.error('❌ Error testing wristband system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWristbandSystem();
