import { NextRequest, NextResponse } from "next/server";
import { handleCleanupExpiredReservations } from "~/server/api/reservations";

/**
 * GET /api/cron/cleanup-reservations
 * Cron job endpoint to clean up expired reservations
 * This should be called periodically (e.g., every 5 minutes) by a cron service
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a cron service (optional security)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Clean up expired reservations
    const result = await handleCleanupExpiredReservations();

    // Log the cleanup result
    console.log(`[CRON] Reservation cleanup completed: ${result.message}`);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[CRON] Error during reservation cleanup:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to clean up expired reservations",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/cleanup-reservations
 * Manual trigger for cleanup (same as GET but for manual testing)
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
