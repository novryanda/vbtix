import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { OrderExpirationService } from "~/server/services/order-expiration.service";

/**
 * POST /api/admin/orders/expire
 * Manually trigger order expiration process (admin only)
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

    // Only admins can trigger order expiration
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Trigger order expiration
    const results = await OrderExpirationService.expireAllOverdueOrders();

    return NextResponse.json({
      success: true,
      data: results,
      message: `Expired ${results.expired} orders`,
    });
  } catch (error: any) {
    console.error("Error triggering order expiration:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to expire orders",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/admin/orders/expire
 * Get information about orders that need to be expired
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

    // Only admins can view expiration info
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Get expired orders
    const expiredOrders = await OrderExpirationService.findExpiredOrders();

    // Add expiration info to each order
    const ordersWithExpirationInfo = expiredOrders.map((order) => ({
      id: order.id,
      invoiceNumber: order.invoiceNumber,
      status: order.status,
      amount: order.amount,
      createdAt: order.createdAt,
      expirationInfo: OrderExpirationService.getOrderExpirationInfo(order.createdAt),
      timeRemaining: OrderExpirationService.formatTimeRemaining(order.createdAt),
    }));

    return NextResponse.json({
      success: true,
      data: {
        expiredOrders: ordersWithExpirationInfo,
        count: expiredOrders.length,
      },
    });
  } catch (error: any) {
    console.error("Error getting expiration info:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get expiration info",
      },
      { status: 500 },
    );
  }
}
