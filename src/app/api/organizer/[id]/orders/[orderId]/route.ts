import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { handleGetOrganizerOrderById } from "~/server/api/organizer-orders";

/**
 * GET /api/organizer/[id]/orders/[orderId]
 * Get order details for organizer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; orderId: string }> },
) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Only organizers can view order details
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { id, orderId } = await params;

    // Get order details
    const order = await handleGetOrganizerOrderById({
      userId: session.user.id,
      orderId: orderId,
    });

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    const { orderId } = await params;
    console.error(`Error fetching organizer order ${orderId}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch order details",
      },
      {
        status:
          error.message ===
          "Order not found or you don't have permission to view it"
            ? 404
            : 500,
      },
    );
  }
}
