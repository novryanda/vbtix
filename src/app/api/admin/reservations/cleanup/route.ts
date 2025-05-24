import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { handleCleanupExpiredReservations } from "~/server/api/reservations";

/**
 * POST /api/admin/reservations/cleanup
 * Clean up expired reservations (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Only admins can trigger cleanup
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    // Clean up expired reservations
    const result = await handleCleanupExpiredReservations();

    return NextResponse.json({
      success: true,
      data: result,
      message: result.message,
    });
  } catch (error: any) {
    console.error("Error cleaning up expired reservations:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to clean up expired reservations",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/admin/reservations/cleanup
 * Get cleanup status and statistics (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Only admins can view cleanup stats
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    // Get reservation statistics
    const { prisma } = await import("~/server/db");

    const [
      totalReservations,
      activeReservations,
      expiredReservations,
      convertedReservations,
      cancelledReservations,
    ] = await Promise.all([
      prisma.ticketReservation.count(),
      prisma.ticketReservation.count({
        where: {
          status: "ACTIVE",
          expiresAt: { gt: new Date() },
        },
      }),
      prisma.ticketReservation.count({
        where: {
          OR: [
            { status: "EXPIRED" },
            {
              status: "ACTIVE",
              expiresAt: { lt: new Date() },
            },
          ],
        },
      }),
      prisma.ticketReservation.count({
        where: { status: "CONVERTED" },
      }),
      prisma.ticketReservation.count({
        where: { status: "CANCELLED" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        statistics: {
          total: totalReservations,
          active: activeReservations,
          expired: expiredReservations,
          converted: convertedReservations,
          cancelled: cancelledReservations,
        },
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error getting cleanup statistics:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get cleanup statistics",
      },
      { status: 500 },
    );
  }
}
