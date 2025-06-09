import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { handleUpdateOrganizerOrderStatus } from "~/server/api/organizer-orders";

// Validation schema for order status update
const orderStatusSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
  notes: z.string().optional(),
});

/**
 * PATCH /api/organizer/[id]/orders/[orderId]/status
 * Update order status (approve/reject manual payment) by organizer
 */
export async function PATCH(
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

    // Only organizers can update order status
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
    const body = await request.json();

    try {
      // Validate input using Zod schema
      const validatedData = orderStatusSchema.parse(body);

      // Update order status
      const updatedOrder = await handleUpdateOrganizerOrderStatus({
        userId: session.user.id,
        orderId: orderId,
        status: validatedData.status,
        notes: validatedData.notes,
      });

      return NextResponse.json({
        success: true,
        data: updatedOrder,
        message: "Order status updated successfully",
      });
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: validationError },
        { status: 400 },
      );
    }
  } catch (error: any) {
    const { orderId } = await params;
    console.error(`Error updating order ${orderId} status:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update order status",
      },
      {
        status:
          error.message ===
          "Order not found or you don't have permission to update it"
            ? 404
            : 500,
      },
    );
  }
}
