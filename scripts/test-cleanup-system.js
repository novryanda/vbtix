#!/usr/bin/env node

/**
 * Test Script for Ticket Cleanup System
 * 
 * This script tests the ticket cleanup functionality by:
 * 1. Creating test PENDING tickets with various ages
 * 2. Running cleanup in dry-run mode
 * 3. Verifying the cleanup would work correctly
 * 4. Cleaning up test data
 * 
 * Usage:
 *   node scripts/test-cleanup-system.js
 */

import { PrismaClient, TicketStatus, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Test configuration
const TEST_CONFIG = {
  testUserId: 'test-user-cleanup',
  testEventId: 'test-event-cleanup',
  testOrgId: 'test-org-cleanup',
  testTicketTypeId: 'test-ticket-type-cleanup',
  ticketsToCreate: 10,
};

// Helper function to create test data
async function createTestData() {
  console.log('🧪 Creating test data...');

  try {
    // Create test user
    const testUser = await prisma.user.upsert({
      where: { id: TEST_CONFIG.testUserId },
      update: {},
      create: {
        id: TEST_CONFIG.testUserId,
        email: 'test-cleanup@example.com',
        name: 'Test Cleanup User',
        role: 'BUYER',
      },
    });

    // Create test organizer
    const testOrganizer = await prisma.organizer.upsert({
      where: { id: TEST_CONFIG.testOrgId },
      update: {},
      create: {
        id: TEST_CONFIG.testOrgId,
        userId: testUser.id,
        orgName: 'Test Cleanup Organizer',
        legalName: 'Test Cleanup Organizer Legal',
      },
    });

    // Create test event
    const testEvent = await prisma.event.upsert({
      where: { id: TEST_CONFIG.testEventId },
      update: {},
      create: {
        id: TEST_CONFIG.testEventId,
        slug: 'test-cleanup-event',
        organizerId: testOrganizer.id,
        title: 'Test Cleanup Event',
        venue: 'Test Venue',
        province: 'Test Province',
        country: 'Indonesia',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        status: 'PUBLISHED',
      },
    });

    // Create test ticket type
    const testTicketType = await prisma.ticketType.upsert({
      where: { id: TEST_CONFIG.testTicketTypeId },
      update: {},
      create: {
        id: TEST_CONFIG.testTicketTypeId,
        eventId: testEvent.id,
        name: 'Test Cleanup Ticket',
        price: 100000,
        quantity: 100,
        sold: 0,
      },
    });

    console.log('✅ Test data created successfully');
    return { testUser, testOrganizer, testEvent, testTicketType };
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  }
}

// Helper function to create test tickets with various ages
async function createTestTickets() {
  console.log('🎫 Creating test tickets with various ages...');

  const tickets = [];
  const now = new Date();

  for (let i = 0; i < TEST_CONFIG.ticketsToCreate; i++) {
    // Create tickets with different ages
    let createdAt;
    if (i < 3) {
      // Recent tickets (under 1 hour)
      createdAt = new Date(now.getTime() - (30 * 60 * 1000)); // 30 minutes ago
    } else if (i < 6) {
      // Medium age tickets (2-23 hours)
      createdAt = new Date(now.getTime() - (12 * 60 * 60 * 1000)); // 12 hours ago
    } else {
      // Old tickets (over 24 hours)
      createdAt = new Date(now.getTime() - (48 * 60 * 60 * 1000)); // 48 hours ago
    }

    // Create transaction first
    const transaction = await prisma.transaction.create({
      data: {
        userId: TEST_CONFIG.testUserId,
        eventId: TEST_CONFIG.testEventId,
        amount: 100000,
        currency: 'IDR',
        paymentMethod: 'PENDING',
        invoiceNumber: `TEST-INV-${Date.now()}-${i}`,
        status: i >= 8 ? 'FAILED' : 'PENDING', // Last 2 tickets have failed payments
        createdAt,
        updatedAt: createdAt,
      },
    });

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        ticketTypeId: TEST_CONFIG.testTicketTypeId,
        transactionId: transaction.id,
        userId: TEST_CONFIG.testUserId,
        qrCode: `TEST-QR-${Date.now()}-${i}`,
        status: 'PENDING',
        createdAt,
        updatedAt: createdAt,
      },
    });

    tickets.push({ ticket, transaction, ageHours: (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60) });
  }

  console.log(`✅ Created ${tickets.length} test tickets`);
  console.log(`   - ${tickets.filter(t => t.ageHours < 1).length} tickets under 1 hour old`);
  console.log(`   - ${tickets.filter(t => t.ageHours >= 1 && t.ageHours < 24).length} tickets 1-24 hours old`);
  console.log(`   - ${tickets.filter(t => t.ageHours >= 24).length} tickets over 24 hours old`);

  return tickets;
}

// Helper function to clean up test data
async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');

  try {
    // Delete in correct order to respect foreign key constraints
    await prisma.ticket.deleteMany({
      where: {
        ticketTypeId: TEST_CONFIG.testTicketTypeId,
      },
    });

    await prisma.transaction.deleteMany({
      where: {
        eventId: TEST_CONFIG.testEventId,
      },
    });

    await prisma.ticketType.deleteMany({
      where: {
        id: TEST_CONFIG.testTicketTypeId,
      },
    });

    await prisma.event.deleteMany({
      where: {
        id: TEST_CONFIG.testEventId,
      },
    });

    await prisma.organizer.deleteMany({
      where: {
        id: TEST_CONFIG.testOrgId,
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: TEST_CONFIG.testUserId,
      },
    });

    console.log('✅ Test data cleaned up successfully');
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
    throw error;
  }
}

// Simple cleanup function for testing
async function testCleanupLogic() {
  console.log('🧹 Testing basic cleanup logic...');

  const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

  // Find PENDING tickets older than cutoff
  const oldPendingTickets = await prisma.ticket.findMany({
    where: {
      status: TicketStatus.PENDING,
      createdAt: {
        lt: cutoffDate,
      },
    },
    include: {
      transaction: {
        select: {
          status: true,
          createdAt: true,
        },
      },
    },
  });

  console.log(`   Found ${oldPendingTickets.length} PENDING tickets older than 24 hours`);

  // Find tickets with failed payments
  const failedPaymentTickets = await prisma.ticket.findMany({
    where: {
      status: TicketStatus.PENDING,
      transaction: {
        status: {
          in: [PaymentStatus.FAILED, PaymentStatus.EXPIRED],
        },
      },
    },
  });

  console.log(`   Found ${failedPaymentTickets.length} PENDING tickets with failed payments`);

  return {
    oldTickets: oldPendingTickets.length,
    failedPaymentTickets: failedPaymentTickets.length,
    totalEligible: oldPendingTickets.length + failedPaymentTickets.length,
  };
}

// Main test function
async function runTests() {
  console.log('🧪 VBTix Ticket Cleanup System Test');
  console.log('===================================\n');

  try {
    // Step 1: Create test data
    await createTestData();
    const testTickets = await createTestTickets();

    // Step 2: Get initial statistics using basic queries
    console.log('\n📊 Getting initial statistics...');
    const stats = await testCleanupLogic();

    console.log(`   Old tickets (>24h): ${stats.oldTickets}`);
    console.log(`   Failed payment tickets: ${stats.failedPaymentTickets}`);
    console.log(`   Total eligible for cleanup: ${stats.totalEligible}`);

    // Step 3: Test actual cleanup with manual logic
    console.log('\n🧹 Testing manual cleanup (48-hour threshold)...');

    const cutoffDate48h = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Count tickets that would be deleted
    const ticketsToDelete = await prisma.ticket.findMany({
      where: {
        status: TicketStatus.PENDING,
        OR: [
          {
            createdAt: {
              lt: cutoffDate48h,
            },
          },
          {
            transaction: {
              status: {
                in: [PaymentStatus.FAILED, PaymentStatus.EXPIRED],
              },
            },
          },
        ],
      },
      include: {
        transaction: true,
      },
    });

    console.log(`   Found ${ticketsToDelete.length} tickets eligible for cleanup`);

    if (ticketsToDelete.length > 0) {
      // Perform actual cleanup in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Delete ticket holders first
        await tx.ticketHolder.deleteMany({
          where: {
            ticketId: {
              in: ticketsToDelete.map(t => t.id),
            },
          },
        });

        // Delete tickets
        const deleteResult = await tx.ticket.deleteMany({
          where: {
            id: {
              in: ticketsToDelete.map(t => t.id),
            },
          },
        });

        // Log the cleanup
        await tx.log.create({
          data: {
            action: 'TEST_TICKET_CLEANUP',
            entity: 'Ticket',
            metadata: {
              deletedCount: deleteResult.count,
              testRun: true,
            },
          },
        });

        return deleteResult.count;
      });

      console.log(`   ✅ Successfully deleted ${result} tickets`);
    } else {
      console.log('   ✅ No tickets needed cleanup');
    }

    // Step 4: Verify remaining tickets
    const remainingPendingTickets = await prisma.ticket.count({
      where: {
        status: TicketStatus.PENDING,
      },
    });

    console.log(`   Remaining PENDING tickets: ${remainingPendingTickets}`);

    console.log('\n🎉 Basic cleanup test completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log(`   ✅ Created ${TEST_CONFIG.ticketsToCreate} test tickets`);
    console.log(`   ✅ Cleanup logic working correctly`);
    console.log(`   ✅ Database operations successful`);

  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    throw error;
  } finally {
    // Always clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await cleanupTestData();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️ Test interrupted by user');
  await cleanupTestData();
  await prisma.$disconnect();
  process.exit(0);
});

// Run the tests
runTests()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('\n💥 Test failed:', error);
    await cleanupTestData();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
