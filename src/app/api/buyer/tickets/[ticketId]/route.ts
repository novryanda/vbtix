import { NextRequest, NextResponse } from "next/server";
import { handleGetTicketById } from "~/server/api/buyer-tickets";
import { auth } from "~/server/auth";

/**
 * GET /api/buyer/tickets/[id]
 * Get a specific ticket by ID
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

    // Get ticket by ID
    const ticket = await handleGetTicketById({
      ticketId: id,
      userId: session.user.id,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (error: any) {
    console.error(`Error getting ticket with ID ${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to get ticket details" 
      },
      { 
        status: error.message === "Ticket not found" ? 404 : 500 
      },
    );
  }
}
