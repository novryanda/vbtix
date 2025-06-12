/**
 * Test individual service functions
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDashboardServices() {
  console.log('🧪 Testing Dashboard Services\n');

  try {
    // Test 1: Basic database connection
    console.log('1. Testing database connection...');
    try {
      await prisma.$connect();
      console.log('   ✅ Database connected successfully');
    } catch (error) {
      console.log(`   ❌ Database connection failed: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }

    // Test 2: Test basic counts
    console.log('\n2. Testing basic counts...');
    try {
      const userCount = await prisma.user.count();
      console.log(`   ✅ User count: ${userCount}`);
      
      const eventCount = await prisma.event.count();
      console.log(`   ✅ Event count: ${eventCount}`);
      
      const organizerCount = await prisma.organizer.count();
      console.log(`   ✅ Organizer count: ${organizerCount}`);
    } catch (error) {
      console.log(`   ❌ Basic counts failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Test 3: Test Transaction aggregate (sumber kemungkinan error)
    console.log('\n3. Testing Transaction aggregate...');
    try {
      const salesData = await prisma.transaction.aggregate({
        _sum: { amount: true },
      });
      const totalSales = Number(salesData._sum?.amount) || 0;
      console.log(`   ✅ Total sales: ${totalSales}`);
    } catch (error) {
      console.log(`   ❌ Transaction aggregate failed: ${error instanceof Error ? error.message : String(error)}`);
      console.log('   This might be the source of the 500 error');
    }

    // Test 4: Test Event filtering
    console.log('\n4. Testing Event filtering...');
    try {
      const pendingEvents = await prisma.event.count({ 
        where: { status: 'PENDING_REVIEW' } 
      });
      console.log(`   ✅ Pending events count: ${pendingEvents}`);
    } catch (error) {
      console.log(`   ❌ Event filtering failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Test 5: Test Organizer filtering
    console.log('\n5. Testing Organizer filtering...');
    try {
      const verifiedOrganizers = await prisma.organizer.count({ 
        where: { verified: true } 
      });
      console.log(`   ✅ Verified organizers count: ${verifiedOrganizers}`);
    } catch (error) {
      console.log(`   ❌ Organizer filtering failed: ${error instanceof Error ? error.message : String(error)}`);
    }

  } catch (error) {
    console.error('❌ Service test failed:', error instanceof Error ? error.message : String(error));
  } finally {
    await prisma.$disconnect();
  }
}

testDashboardServices();
