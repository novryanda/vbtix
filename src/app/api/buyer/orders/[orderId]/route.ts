import { NextRequest, NextResponse } from "next/server";
import { handleGetOrderById, handleCancelOrder } from "~/server/api/buyer-orders";
import { auth } from "~/server/auth";

/**
 * GET /api/buyer/orders/[id]
 * Get a specific order by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get order by ID
    const order = await handleGetOrderById({
      orderId: id,
      userId: session.user.id,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error(`Error getting order with ID ${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to get order details" 
      },
      { 
        status: error.message === "Order not found" ? 404 : 500 
      },
    );
  }
}

/**
 * DELETE /api/buyer/orders/[id]
 * Cancel an order
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Cancel order
    const result = await handleCancelOrder({
      orderId: id,
      userId: session.user.id,
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
    console.error(`Error cancelling order with ID ${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to cancel order" 
      },
      { 
        status: error.message === "Order not found" ? 404 : 
                error.message === "Only pending orders can be cancelled" ? 400 : 500 
      },
    );
  }
}
