#!/usr/bin/env node

/**
 * Database Cleanup Script for PENDING Tickets
 * 
 * This script removes ticket records with PENDING status that haven't been 
 * approved by admin yet, ensuring they don't count as sold tickets in system statistics.
 * 
 * Usage:
 *   npm run db:cleanup                    # Interactive mode
 *   node scripts/cleanup-pending-tickets.js --auto --max-age=48  # Automated mode
 *   node scripts/cleanup-pending-tickets.js --dry-run           # Preview mode
 *   node scripts/cleanup-pending-tickets.js --stats             # Statistics only
 * 
 * Options:
 *   --auto                 Run without interactive prompts
 *   --dry-run             Preview what would be deleted without actually deleting
 *   --stats               Show statistics only, don't perform cleanup
 *   --max-age=<hours>     Maximum age in hours for PENDING tickets (default: 24)
 *   --batch-size=<num>    Number of records to process in each batch (default: 100)
 *   --include-failed      Include tickets from failed/expired payments
 *   --help                Show this help message
 */

import { PrismaClient, TicketStatus, PaymentStatus } from '@prisma/client';
import readline from 'readline';

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    auto: false,
    dryRun: false,
    statsOnly: false,
    maxAge: 24,
    batchSize: 100,
    includeFailed: false,
    help: false,
  };

  for (const arg of args) {
    if (arg === '--auto') {
      options.auto = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--stats') {
      options.statsOnly = true;
    } else if (arg === '--include-failed') {
      options.includeFailed = true;
    } else if (arg === '--help') {
      options.help = true;
    } else if (arg.startsWith('--max-age=')) {
      options.maxAge = parseInt(arg.split('=')[1]) || 24;
    } else if (arg.startsWith('--batch-size=')) {
      options.batchSize = parseInt(arg.split('=')[1]) || 100;
    }
  }

  return options;
}

// Show help message
function showHelp() {
  console.log(`
🧹 VBTix Database Cleanup Script

This script removes PENDING tickets that haven't been approved by admin,
ensuring accurate ticket sales statistics.

Usage:
  npm run db:cleanup                    # Interactive mode
  node scripts/cleanup-pending-tickets.js [options]

Options:
  --auto                 Run without interactive prompts
  --dry-run             Preview what would be deleted without actually deleting
  --stats               Show statistics only, don't perform cleanup
  --max-age=<hours>     Maximum age in hours for PENDING tickets (default: 24)
  --batch-size=<num>    Number of records to process in each batch (default: 100)
  --include-failed      Include tickets from failed/expired payments
  --help                Show this help message

Examples:
  # Show statistics only
  npm run db:cleanup -- --stats

  # Dry run to preview cleanup
  npm run db:cleanup -- --dry-run --max-age=48

  # Automated cleanup of tickets older than 48 hours
  npm run db:cleanup -- --auto --max-age=48 --include-failed

Safety Features:
  ✅ Transaction-based operations ensure data integrity
  ✅ Comprehensive logging for audit trail
  ✅ Dry-run mode for safe testing
  ✅ Batch processing to avoid memory issues
  ✅ Preserves ACTIVE and USED tickets
  ✅ Maintains referential integrity
`);
}

// Create readline interface for user input
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

// Ask user for confirmation
function askConfirmation(rl, message) {
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Format numbers with commas
function formatNumber(num) {
  return num.toLocaleString();
}

// Format duration
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

// Get cleanup statistics
async function getCleanupStats(options) {
  const { maxAge = 24, includeFailed = true } = options;
  const cutoffDate = new Date(Date.now() - maxAge * 60 * 60 * 1000);

  try {
    // Get all PENDING tickets with their transactions
    const pendingTickets = await prisma.ticket.findMany({
      where: {
        status: TicketStatus.PENDING,
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

    const now = new Date();
    const stats = {
      totalPendingTickets: pendingTickets.length,
      eligibleForDeletion: 0,
      ticketsByAge: {
        under1Hour: 0,
        under24Hours: 0,
        under7Days: 0,
        over7Days: 0,
      },
      ticketsByPaymentStatus: {
        pending: 0,
        failed: 0,
        expired: 0,
      },
    };

    pendingTickets.forEach((ticket) => {
      const ageHours = (now.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
      const paymentStatus = ticket.transaction.status;

      // Count by age
      if (ageHours < 1) {
        stats.ticketsByAge.under1Hour++;
      } else if (ageHours < 24) {
        stats.ticketsByAge.under24Hours++;
      } else if (ageHours < 168) { // 7 days
        stats.ticketsByAge.under7Days++;
      } else {
        stats.ticketsByAge.over7Days++;
      }

      // Count by payment status
      if (paymentStatus === PaymentStatus.PENDING) {
        stats.ticketsByPaymentStatus.pending++;
      } else if (paymentStatus === PaymentStatus.FAILED) {
        stats.ticketsByPaymentStatus.failed++;
      } else if (paymentStatus === PaymentStatus.EXPIRED) {
        stats.ticketsByPaymentStatus.expired++;
      }

      // Check if eligible for deletion
      const isOldEnough = ticket.createdAt < cutoffDate;
      const hasFailedPayment = includeFailed &&
        [PaymentStatus.FAILED, PaymentStatus.EXPIRED].includes(paymentStatus);

      if (isOldEnough || hasFailedPayment) {
        stats.eligibleForDeletion++;
      }
    });

    return stats;
  } catch (error) {
    console.error("Error getting cleanup stats:", error);
    throw new Error("Failed to retrieve cleanup statistics");
  }
}

// Display statistics
async function displayStats(options) {
  console.log('\n📊 Analyzing PENDING tickets...\n');

  try {
    const stats = await getCleanupStats({
      maxAge: options.maxAge,
      includeFailed: options.includeFailed,
    });

    console.log('📈 Current Statistics:');
    console.log(`   Total PENDING tickets: ${formatNumber(stats.totalPendingTickets)}`);
    console.log(`   Eligible for deletion: ${formatNumber(stats.eligibleForDeletion)}`);
    console.log('');

    console.log('⏰ Tickets by Age:');
    console.log(`   Under 1 hour:  ${formatNumber(stats.ticketsByAge.under1Hour)}`);
    console.log(`   Under 24 hours: ${formatNumber(stats.ticketsByAge.under24Hours)}`);
    console.log(`   Under 7 days:   ${formatNumber(stats.ticketsByAge.under7Days)}`);
    console.log(`   Over 7 days:    ${formatNumber(stats.ticketsByAge.over7Days)}`);
    console.log('');

    console.log('💳 Tickets by Payment Status:');
    console.log(`   Pending payments: ${formatNumber(stats.ticketsByPaymentStatus.pending)}`);
    console.log(`   Failed payments:  ${formatNumber(stats.ticketsByPaymentStatus.failed)}`);
    console.log(`   Expired payments: ${formatNumber(stats.ticketsByPaymentStatus.expired)}`);
    console.log('');

    console.log('🎯 Cleanup Criteria:');
    console.log(`   Max age: ${options.maxAge} hours`);
    console.log(`   Include failed payments: ${options.includeFailed ? 'Yes' : 'No'}`);
    console.log(`   Batch size: ${formatNumber(options.batchSize)}`);

    return stats;
  } catch (error) {
    console.error('❌ Error getting statistics:', error.message);
    throw error;
  }
}

// Perform cleanup
async function performCleanup(options) {
  console.log('\n🧹 Starting cleanup process...\n');
  const startTime = Date.now();

  try {
    const {
      dryRun = false,
      maxAge = 24,
      batchSize = 100,
      includeFailed = true,
    } = options;

    // Calculate cutoff date
    const cutoffDate = new Date(Date.now() - maxAge * 60 * 60 * 1000);

    // Build where clause for tickets to delete
    const whereClause = {
      status: TicketStatus.PENDING,
      OR: [
        // Old PENDING tickets
        {
          createdAt: {
            lt: cutoffDate,
          },
        },
      ],
    };

    // Include failed/expired payments if requested
    if (includeFailed) {
      whereClause.OR.push({
        transaction: {
          status: {
            in: [PaymentStatus.FAILED, PaymentStatus.EXPIRED],
          },
        },
      });
    }

    // Get tickets to be deleted
    const ticketsToDelete = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        transaction: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            eventId: true,
          },
        },
        ticketType: {
          select: {
            id: true,
            name: true,
            eventId: true,
          },
        },
      },
      take: batchSize,
    });

    console.log(`🎫 Found ${ticketsToDelete.length} tickets eligible for cleanup`);

    const result = {
      success: false,
      deletedTickets: ticketsToDelete.length,
      affectedTransactions: new Set(ticketsToDelete.map(t => t.transaction.id)).size,
      affectedTicketTypes: new Set(ticketsToDelete.map(t => t.ticketType.id)).size,
      errors: [],
      executionTimeMs: 0,
    };

    if (ticketsToDelete.length === 0) {
      result.success = true;
      result.executionTimeMs = Date.now() - startTime;
      console.log("✅ No tickets found for cleanup");
      return result;
    }

    if (dryRun) {
      result.success = true;
      result.executionTimeMs = Date.now() - startTime;
      console.log(`🔍 DRY RUN: Would delete ${ticketsToDelete.length} tickets`);
      console.log(`📊 Would affect ${result.affectedTransactions} transactions and ${result.affectedTicketTypes} ticket types`);
      return result;
    }

    // Perform cleanup in transaction
    await prisma.$transaction(async (tx) => {
      // Log cleanup activity
      await tx.log.create({
        data: {
          action: "TICKET_CLEANUP_START",
          entity: "Ticket",
          metadata: {
            ticketCount: ticketsToDelete.length,
            transactionCount: result.affectedTransactions,
            ticketTypeCount: result.affectedTicketTypes,
            options,
            cutoffDate: cutoffDate.toISOString(),
          },
        },
      });

      // Delete tickets in batches
      const ticketIds = ticketsToDelete.map(t => t.id);

      // Delete related ticket holders first (due to foreign key constraints)
      await tx.ticketHolder.deleteMany({
        where: {
          ticketId: {
            in: ticketIds,
          },
        },
      });

      // Delete the tickets
      const deleteResult = await tx.ticket.deleteMany({
        where: {
          id: {
            in: ticketIds,
          },
        },
      });

      result.deletedTickets = deleteResult.count;

      // Log cleanup completion
      await tx.log.create({
        data: {
          action: "TICKET_CLEANUP_COMPLETE",
          entity: "Ticket",
          metadata: {
            deletedTickets: result.deletedTickets,
            affectedTransactions: result.affectedTransactions,
            affectedTicketTypes: result.affectedTicketTypes,
            executionTimeMs: Date.now() - startTime,
          },
        },
      });
    });

    result.success = true;
    result.executionTimeMs = Date.now() - startTime;

    console.log('\n✅ Cleanup Results:');
    console.log(`   ${options.dryRun ? 'Would delete' : 'Deleted'}: ${formatNumber(result.deletedTickets)} tickets`);
    console.log(`   Affected transactions: ${formatNumber(result.affectedTransactions)}`);
    console.log(`   Affected ticket types: ${formatNumber(result.affectedTicketTypes)}`);
    console.log(`   Execution time: ${formatDuration(result.executionTimeMs)}`);

    return result;
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    throw error;
  }
}

// Main function
async function main() {
  const options = parseArgs();

  // Show help if requested
  if (options.help) {
    showHelp();
    return;
  }

  console.log('🧹 VBTix Database Cleanup Script');
  console.log('================================\n');

  try {
    // Display statistics
    const stats = await displayStats(options);

    // If stats only, exit here
    if (options.statsOnly) {
      console.log('📊 Statistics complete. Use --dry-run to preview cleanup or --auto to perform cleanup.');
      return;
    }

    // If no tickets to clean up, exit
    if (stats.eligibleForDeletion === 0) {
      console.log('✅ No tickets found for cleanup. Database is clean!');
      return;
    }

    // Interactive confirmation (unless auto mode)
    if (!options.auto && !options.dryRun) {
      const rl = createReadlineInterface();
      
      console.log(`\n⚠️  This will permanently delete ${formatNumber(stats.eligibleForDeletion)} PENDING tickets.`);
      console.log('   This action cannot be undone.');
      
      const confirmed = await askConfirmation(rl, '\nDo you want to proceed?');
      rl.close();

      if (!confirmed) {
        console.log('❌ Cleanup cancelled by user.');
        return;
      }
    }

    // Perform cleanup
    const result = await performCleanup(options);

    // Clean up orphaned transactions if main cleanup was successful
    if (result.success && !options.dryRun && result.deletedTickets > 0) {
      console.log('\n🧹 Cleaning up orphaned transactions...');

      // Find transactions with no tickets
      const orphanedTransactions = await prisma.transaction.findMany({
        where: {
          tickets: {
            none: {},
          },
          status: {
            in: [PaymentStatus.FAILED, PaymentStatus.EXPIRED],
          },
        },
      });

      if (orphanedTransactions.length > 0) {
        const transactionIds = orphanedTransactions.map(t => t.id);

        await prisma.$transaction(async (tx) => {
          // Delete related records first
          await tx.buyerInfo.deleteMany({
            where: {
              transactionId: {
                in: transactionIds,
              },
            },
          });

          await tx.orderItem.deleteMany({
            where: {
              orderId: {
                in: transactionIds,
              },
            },
          });

          await tx.payment.deleteMany({
            where: {
              orderId: {
                in: transactionIds,
              },
            },
          });

          // Delete transactions
          await tx.transaction.deleteMany({
            where: {
              id: {
                in: transactionIds,
              },
            },
          });

          // Log cleanup
          await tx.log.create({
            data: {
              action: "ORPHANED_TRANSACTIONS_CLEANUP",
              entity: "Transaction",
              metadata: {
                deletedCount: transactionIds.length,
                transactionIds,
              },
            },
          });
        });

        console.log(`✅ Deleted ${formatNumber(orphanedTransactions.length)} orphaned transactions`);
      } else {
        console.log('✅ No orphaned transactions found');
      }
    }

    console.log('\n🎉 Cleanup process completed successfully!');
    
    if (options.dryRun) {
      console.log('\n💡 This was a dry run. To perform actual cleanup, run without --dry-run flag.');
    }

  } catch (error) {
    console.error('\n💥 Script failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️ Script interrupted by user');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n⚠️ Script terminated');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the script
main().catch(async (error) => {
  console.error('💥 Unhandled error:', error);
  await prisma.$disconnect();
  process.exit(1);
});
