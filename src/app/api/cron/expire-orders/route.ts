import { NextRequest, NextResponse } from "next/server";
import { OrderExpirationService } from "~/server/services/order-expiration.service";

/**
 * POST /api/cron/expire-orders
 * Cron job endpoint to automatically expire overdue orders
 * This can be called by external cron services like Vercel Cron or GitHub Actions
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication for cron jobs
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    // If CRON_SECRET is set, require it for authentication
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    console.log("🕐 Cron job: Starting order expiration process...");

    // Trigger order expiration
    const results = await OrderExpirationService.expireAllOverdueOrders();

    console.log(`🕐 Cron job: Completed. Expired ${results.expired} orders`);

    return NextResponse.json({
      success: true,
      data: results,
      message: `Cron job completed: Expired ${results.expired} orders`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("🕐 Cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Cron job failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/cron/expire-orders
 * Health check for the cron job endpoint
 */
export async function GET(request: NextRequest) {
  try {
    // Get count of orders that would be expired
    const expiredOrders = await OrderExpirationService.findExpiredOrders();

    return NextResponse.json({
      success: true,
      data: {
        pendingExpiration: expiredOrders.length,
        lastCheck: new Date().toISOString(),
      },
      message: `${expiredOrders.length} orders pending expiration`,
    });
  } catch (error: any) {
    console.error("Cron health check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Health check failed",
      },
      { status: 500 },
    );
  }
}
