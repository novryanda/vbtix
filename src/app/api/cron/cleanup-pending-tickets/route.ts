import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, TicketStatus, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Get cleanup statistics
async function getCleanupStats(options: {
  maxAge?: number;
  includeFailedPayments?: boolean;
}) {
  const { maxAge = 24, includeFailedPayments = true } = options;
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
      const hasFailedPayment = includeFailedPayments &&
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

// Perform cleanup
async function performCleanup(options: {
  dryRun?: boolean;
  maxAge?: number;
  batchSize?: number;
  includeFailedPayments?: boolean;
}) {
  const startTime = Date.now();
  const {
    dryRun = false,
    maxAge = 24,
    batchSize = 100,
    includeFailedPayments = true,
  } = options;

  try {
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
      affectedTicketTypes: Array.from(new Set(ticketsToDelete.map(t => t.ticketType.id))),
      errors: [] as string[],
      executionTimeMs: 0,
      timestamp: new Date().toISOString(),
    };

    if (ticketsToDelete.length === 0) {
      result.success = true;
      result.executionTimeMs = Date.now() - startTime;
      console.log("✅ [CRON] No tickets found for cleanup");
      return result;
    }

    if (dryRun) {
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

    console.log(`🧹 [CRON] Cleanup result: ${result.deletedTickets} tickets deleted`);

    return result;
  } catch (error: any) {
    console.error('❌ Cleanup failed:', error.message);
    throw error;
  }
}

/**
 * GET /api/cron/cleanup-pending-tickets
 * Cron job endpoint to clean up PENDING tickets that haven't been approved by admin
 * 
 * This endpoint should be called periodically (e.g., daily) by a cron service
 * to maintain accurate ticket sales statistics by removing stale PENDING tickets.
 * 
 * Query Parameters:
 *   - maxAge: Maximum age in hours for PENDING tickets (default: 24)
 *   - batchSize: Number of records to process in each batch (default: 100)
 *   - includeFailedPayments: Include tickets from failed/expired payments (default: true)
 *   - dryRun: Preview mode without actual deletion (default: false)
 * 
 * Authentication:
 *   - Requires CRON_SECRET environment variable if set
 *   - Use Authorization: Bearer <CRON_SECRET> header
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify the request is from a cron service (optional security)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn("🚫 Unauthorized cron cleanup attempt");
      return NextResponse.json(
        { 
          success: false, 
          error: "Unauthorized",
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const maxAge = parseInt(searchParams.get("maxAge") || "24");
    const batchSize = parseInt(searchParams.get("batchSize") || "100");
    const includeFailedPayments = searchParams.get("includeFailedPayments") !== "false";
    const dryRun = searchParams.get("dryRun") === "true";

    console.log(`🕐 [CRON] Starting PENDING ticket cleanup ${dryRun ? '(DRY RUN)' : ''}...`);
    console.log(`📊 [CRON] Parameters: maxAge=${maxAge}h, batchSize=${batchSize}, includeFailedPayments=${includeFailedPayments}`);

    // Get cleanup statistics first
    const stats = await getCleanupStats({
      maxAge,
      includeFailedPayments,
    });

    console.log(`📈 [CRON] Found ${stats.totalPendingTickets} PENDING tickets, ${stats.eligibleForDeletion} eligible for cleanup`);

    // Perform cleanup if there are tickets to clean
    let cleanupResult = null;

    if (stats.eligibleForDeletion > 0) {
      // Clean up PENDING tickets
      cleanupResult = await performCleanup({
        dryRun,
        maxAge,
        batchSize,
        includeFailedPayments,
      });

      console.log(`🧹 [CRON] Cleanup result: ${cleanupResult.deletedTickets} tickets ${dryRun ? 'would be' : ''} deleted`);
    } else {
      console.log(`✅ [CRON] No tickets found for cleanup`);
    }

    const executionTime = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    console.log(`🕐 [CRON] Cleanup completed in ${executionTime}ms`);

    // Return comprehensive response
    return NextResponse.json({
      success: true,
      data: {
        statistics: stats,
        cleanup: cleanupResult,
        executionTimeMs: executionTime,
        parameters: {
          maxAge,
          batchSize,
          includeFailedPayments,
          dryRun,
        },
      },
      message: cleanupResult
        ? `Cleanup completed: ${cleanupResult.deletedTickets} tickets ${dryRun ? 'would be' : ''} deleted`
        : "No cleanup needed",
      timestamp,
    });

  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error.message || "Failed to clean up PENDING tickets";
    
    console.error("🕐 [CRON] Error during PENDING ticket cleanup:", error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        executionTimeMs: executionTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/cleanup-pending-tickets
 * Manual trigger for cleanup (same as GET but for manual testing)
 * Accepts JSON body with cleanup options
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Unauthorized",
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse request body for options
    let options = {};
    try {
      const body = await request.json();
      options = body || {};
    } catch {
      // If no body or invalid JSON, use defaults
      options = {};
    }

    const {
      maxAge = 24,
      batchSize = 100,
      includeFailedPayments = true,
      dryRun = false,
      statsOnly = false,
    } = options as any;

    console.log(`🕐 [CRON-POST] Starting PENDING ticket cleanup ${dryRun ? '(DRY RUN)' : ''}...`);

    // Get statistics
    const stats = await getCleanupStats({
      maxAge,
      includeFailedPayments,
    });

    // If stats only, return early
    if (statsOnly) {
      return NextResponse.json({
        success: true,
        data: {
          statistics: stats,
          parameters: { maxAge, batchSize, includeFailedPayments, dryRun, statsOnly },
        },
        message: "Statistics retrieved successfully",
        timestamp: new Date().toISOString(),
      });
    }

    // Perform cleanup
    let cleanupResult = null;

    if (stats.eligibleForDeletion > 0) {
      cleanupResult = await performCleanup({
        dryRun,
        maxAge,
        batchSize,
        includeFailedPayments,
      });
    }

    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        statistics: stats,
        cleanup: cleanupResult,
        executionTimeMs: executionTime,
        parameters: { maxAge, batchSize, includeFailedPayments, dryRun, statsOnly },
      },
      message: cleanupResult
        ? `Manual cleanup completed: ${cleanupResult.deletedTickets} tickets ${dryRun ? 'would be' : ''} deleted`
        : "No cleanup needed",
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.error("🕐 [CRON-POST] Error during manual cleanup:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Manual cleanup failed",
        executionTimeMs: executionTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
