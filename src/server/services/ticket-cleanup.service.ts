import { prisma } from "~/server/db";
import { TicketStatus, PaymentStatus } from "@prisma/client";

/**
 * Interface for cleanup operation results
 */
export interface CleanupResult {
  success: boolean;
  deletedTickets: number;
  affectedTransactions: number;
  affectedTicketTypes: string[];
  errors: string[];
  executionTimeMs: number;
  timestamp: Date;
}

/**
 * Interface for cleanup options
 */
export interface CleanupOptions {
  dryRun?: boolean;
  maxAge?: number; // Maximum age in hours for PENDING tickets
  batchSize?: number; // Number of records to process in each batch
  includeFailedPayments?: boolean; // Whether to include tickets from failed payments
}

/**
 * Interface for cleanup statistics
 */
export interface CleanupStats {
  totalPendingTickets: number;
  eligibleForDeletion: number;
  ticketsByAge: {
    under1Hour: number;
    under24Hours: number;
    under7Days: number;
    over7Days: number;
  };
  ticketsByPaymentStatus: {
    pending: number;
    failed: number;
    expired: number;
  };
}

/**
 * Ticket Cleanup Service
 * Handles removal of PENDING tickets that haven't been approved by admin
 * Maintains data integrity and provides comprehensive logging
 */
export class TicketCleanupService {
  /**
   * Get statistics about PENDING tickets eligible for cleanup
   */
  static async getCleanupStats(options: CleanupOptions = {}): Promise<CleanupStats> {
    const { maxAge = 24 } = options;
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
      const stats: CleanupStats = {
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
        const hasFailedPayment = options.includeFailedPayments && 
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

  /**
   * Clean up PENDING tickets based on specified criteria
   */
  static async cleanupPendingTickets(options: CleanupOptions = {}): Promise<CleanupResult> {
    const startTime = Date.now();
    const {
      dryRun = false,
      maxAge = 24, // 24 hours default
      batchSize = 100,
      includeFailedPayments = true,
    } = options;

    const result: CleanupResult = {
      success: false,
      deletedTickets: 0,
      affectedTransactions: 0,
      affectedTicketTypes: [],
      errors: [],
      executionTimeMs: 0,
      timestamp: new Date(),
    };

    try {
      console.log(`🧹 Starting ticket cleanup ${dryRun ? '(DRY RUN)' : ''}...`);
      console.log(`📊 Options: maxAge=${maxAge}h, batchSize=${batchSize}, includeFailedPayments=${includeFailedPayments}`);

      // Calculate cutoff date
      const cutoffDate = new Date(Date.now() - maxAge * 60 * 60 * 1000);

      // Build where clause for tickets to delete
      const whereClause: any = {
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
      if (includeFailedPayments) {
        whereClause.OR.push({
          transaction: {
            status: {
              in: [PaymentStatus.FAILED, PaymentStatus.EXPIRED],
            },
          },
        });
      }

      // Get tickets to be deleted (with related data for logging)
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

      if (ticketsToDelete.length === 0) {
        result.success = true;
        result.executionTimeMs = Date.now() - startTime;
        console.log("✅ No tickets found for cleanup");
        return result;
      }

      // Collect statistics
      const transactionIds = new Set(ticketsToDelete.map(t => t.transaction.id));
      const ticketTypeIds = new Set(ticketsToDelete.map(t => t.ticketType.id));

      result.affectedTransactions = transactionIds.size;
      result.affectedTicketTypes = Array.from(ticketTypeIds);

      if (dryRun) {
        result.deletedTickets = ticketsToDelete.length;
        result.success = true;
        result.executionTimeMs = Date.now() - startTime;
        console.log(`🔍 DRY RUN: Would delete ${ticketsToDelete.length} tickets`);
        console.log(`📊 Would affect ${result.affectedTransactions} transactions and ${result.affectedTicketTypes.length} ticket types`);
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
              ticketTypeCount: result.affectedTicketTypes.length,
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

        // Log individual ticket deletions for audit trail
        for (const ticket of ticketsToDelete) {
          await tx.log.create({
            data: {
              action: "TICKET_DELETED",
              entity: "Ticket",
              entityId: ticket.id,
              metadata: {
                ticketTypeId: ticket.ticketType.id,
                ticketTypeName: ticket.ticketType.name,
                transactionId: ticket.transaction.id,
                transactionStatus: ticket.transaction.status,
                eventId: ticket.transaction.eventId,
                reason: "PENDING_CLEANUP",
                ageHours: Math.round((Date.now() - ticket.createdAt.getTime()) / (1000 * 60 * 60)),
              },
            },
          });
        }

        // Log cleanup completion
        await tx.log.create({
          data: {
            action: "TICKET_CLEANUP_COMPLETE",
            entity: "Ticket",
            metadata: {
              deletedTickets: result.deletedTickets,
              affectedTransactions: result.affectedTransactions,
              affectedTicketTypes: result.affectedTicketTypes.length,
              executionTimeMs: Date.now() - startTime,
            },
          },
        });
      });

      result.success = true;
      result.executionTimeMs = Date.now() - startTime;

      console.log(`✅ Cleanup completed successfully`);
      console.log(`🗑️ Deleted ${result.deletedTickets} PENDING tickets`);
      console.log(`📊 Affected ${result.affectedTransactions} transactions and ${result.affectedTicketTypes.length} ticket types`);
      console.log(`⏱️ Execution time: ${result.executionTimeMs}ms`);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      result.errors.push(errorMessage);
      result.executionTimeMs = Date.now() - startTime;

      console.error("❌ Cleanup failed:", error);

      // Log error
      try {
        await prisma.log.create({
          data: {
            action: "TICKET_CLEANUP_ERROR",
            entity: "Ticket",
            metadata: {
              error: errorMessage,
              options,
              executionTimeMs: result.executionTimeMs,
            },
          },
        });
      } catch (logError) {
        console.error("Failed to log cleanup error:", logError);
      }

      throw error;
    }
  }

  /**
   * Clean up orphaned transactions (transactions with no tickets)
   */
  static async cleanupOrphanedTransactions(dryRun = false): Promise<{
    deletedTransactions: number;
    errors: string[];
  }> {
    try {
      console.log(`🧹 Cleaning up orphaned transactions ${dryRun ? '(DRY RUN)' : ''}...`);

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
        include: {
          _count: {
            select: {
              tickets: true,
            },
          },
        },
      });

      console.log(`📊 Found ${orphanedTransactions.length} orphaned transactions`);

      if (orphanedTransactions.length === 0 || dryRun) {
        return {
          deletedTransactions: orphanedTransactions.length,
          errors: [],
        };
      }

      // Delete orphaned transactions and related data
      const result = await prisma.$transaction(async (tx) => {
        const transactionIds = orphanedTransactions.map(t => t.id);

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
        const deleteResult = await tx.transaction.deleteMany({
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
              deletedCount: deleteResult.count,
              transactionIds,
            },
          },
        });

        return deleteResult.count;
      });

      console.log(`✅ Deleted ${result} orphaned transactions`);

      return {
        deletedTransactions: result,
        errors: [],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Orphaned transaction cleanup failed:", error);
      return {
        deletedTransactions: 0,
        errors: [errorMessage],
      };
    }
  }
}
