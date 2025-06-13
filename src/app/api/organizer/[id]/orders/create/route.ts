import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { handleCreateOrganizerOrder } from "~/server/api/organizer-order-creation";
import { organizerOrderCreateSchema } from "~/lib/validations/organizer-order.schema";
import { UserRole } from "@prisma/client";

/**
 * POST /api/organizer/[id]/orders/create
 * Create a new order as an organizer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Only organizers can create orders
    if (session.user.role !== UserRole.ORGANIZER) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Only organizers can create orders" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();
    
    const validationResult = organizerOrderCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Create the order
    const order = await handleCreateOrganizerOrder(
      validationResult.data,
      session.user.id
    );

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        invoiceNumber: order.invoiceNumber,
        amount: order.amount.toString(),
        status: order.status,
        createdAt: order.createdAt,
      },
      message: "Order created successfully",
    });

  } catch (error: any) {
    console.error("Error creating organizer order:", error);
    
    // Handle specific error types
    if (error.message.includes("not an organizer")) {
      return NextResponse.json(
        { success: false, error: "User is not an organizer" },
        { status: 403 }
      );
    }
    
    if (error.message.includes("not found") || error.message.includes("not owned")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }
    
    if (error.message.includes("Insufficient tickets")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create order",
      },
      { status: 500 }
    );
  }
}
