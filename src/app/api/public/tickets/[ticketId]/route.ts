import { NextRequest, NextResponse } from "next/server";
import { handleGetTicketById } from "~/server/api/buyer-tickets";
import { auth } from "~/server/auth";

/**
 * GET /api/buyer/tickets/[id]
 * Get a specific ticket by ID
 * This endpoint requires authentication
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required to view ticket details",
          message: "Please log in to view ticket details",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

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
    const { id } = await params;
    console.error(`Error getting ticket with ID ${id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get ticket details",
      },
      {
        status: error.message === "Ticket not found" ? 404 : 500,
      },
    );
  }
}
