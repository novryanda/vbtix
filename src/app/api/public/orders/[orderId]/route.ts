import { NextRequest, NextResponse } from "next/server";
import {
  handleGetOrderById,
  handleCancelOrder,
} from "~/server/api/buyer-orders";
import { auth } from "~/server/auth";

/**
 * GET /api/public/orders/[orderId]
 * Get a specific order by ID (public endpoint for guest purchases)
 * This endpoint allows guest access for payment purposes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    // Check authentication (optional for guest purchases)
    const session = await auth();

    // Unwrap params
    const { orderId } = await params;

    // Get query parameters for guest access
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");

    // For guest users, we need either a session ID or authentication
    if (!session?.user && !sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication or session ID required to view order details",
          message:
            "Please provide a session ID or log in to view order details",
        },
        { status: 401 },
      );
    }

    // Get order by ID
    const order = await handleGetOrderById({
      orderId,
      userId: session?.user?.id || null,
      sessionId: sessionId || undefined,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error(
      `Error getting order with ID ${(await params).orderId}:`,
      error,
    );
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get order details",
      },
      {
        status: error.message === "Order not found" ? 404 : 500,
      },
    );
  }
}

/**
 * DELETE /api/public/orders/[orderId]
 * Cancel an order (supports guest purchases)
 * This endpoint allows guest access using sessionId
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    // Check authentication (optional for guest purchases)
    const session = await auth();

    // Unwrap params
    const { orderId } = await params;

    // Get query parameters for guest access
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");

    // For guest users, we need either a session ID or authentication
    if (!session?.user && !sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication or session ID required to cancel orders",
          message: "Please provide a session ID or log in to cancel orders",
        },
        { status: 401 },
      );
    }

    // Cancel order with appropriate user identification
    const result = await handleCancelOrder({
      orderId,
      userId: session?.user?.id || null,
      sessionId: sessionId || undefined,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        status: result.status,
      },
      message: "Order cancelled successfully",
    });
  } catch (error: any) {
    // Get orderId from params if available
    let orderId = "unknown";
    try {
      const resolvedParams = await params;
      orderId = resolvedParams.orderId;
    } catch {
      // Ignore error getting orderId for logging
    }

    console.error(`Error cancelling order with ID ${orderId}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to cancel order",
      },
      {
        status:
          error.message === "Order not found"
            ? 404
            : error.message === "Only pending orders can be cancelled"
              ? 400
              : 500,
      },
    );
  }
}
