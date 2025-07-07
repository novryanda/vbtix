#!/usr/bin/env node

/**
 * Verification Script for Database Cleanup
 * 
 * This script verifies the current state of tickets in the database
 * after cleanup operations.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function verifyCleanup() {
  console.log('🔍 Verifying Database State After Cleanup');
  console.log('==========================================\n');

  try {
    // Get ticket counts by status
    const ticketsByStatus = await prisma.ticket.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    console.log('📊 Tickets by Status:');
    if (ticketsByStatus.length === 0) {
      console.log('   No tickets found in database');
    } else {
      ticketsByStatus.forEach(group => {
        console.log(`   ${group.status}: ${group._count.id} tickets`);
      });
    }

    // Get total ticket count
    const totalTickets = await prisma.ticket.count();
    console.log(`\n📈 Total Tickets: ${totalTickets}`);

    // Check specifically for PENDING tickets
    const pendingTickets = await prisma.ticket.count({
      where: {
        status: 'PENDING',
      },
    });

    console.log(`🎫 PENDING Tickets: ${pendingTickets}`);

    if (pendingTickets === 0) {
      console.log('\n✅ SUCCESS: All PENDING tickets have been cleaned up!');
    } else {
      console.log('\n⚠️  WARNING: There are still PENDING tickets in the database');
    }

    // Get recent cleanup logs
    console.log('\n📋 Recent Cleanup Logs:');
    const recentLogs = await prisma.log.findMany({
      where: {
        action: {
          contains: 'CLEANUP',
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 5,
    });

    if (recentLogs.length === 0) {
      console.log('   No cleanup logs found');
    } else {
      recentLogs.forEach(log => {
        const metadata = typeof log.metadata === 'object' ? log.metadata : {};
        console.log(`   ${log.timestamp.toISOString()}: ${log.action}`);
        if (metadata.deletedTickets || metadata.deletedCount) {
          console.log(`     Deleted: ${metadata.deletedTickets || metadata.deletedCount} items`);
        }
      });
    }

    // Check transaction status
    console.log('\n💳 Transaction Status Summary:');
    const transactionsByStatus = await prisma.transaction.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    if (transactionsByStatus.length === 0) {
      console.log('   No transactions found in database');
    } else {
      transactionsByStatus.forEach(group => {
        console.log(`   ${group.status}: ${group._count.id} transactions`);
      });
    }

    console.log('\n🎉 Verification completed successfully!');

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyCleanup()
  .then(() => {
    console.log('\n✅ Verification completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Verification failed:', error);
    process.exit(1);
  });
