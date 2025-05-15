import { NextRequest, NextResponse } from "next/server";
import { handleGetETicketById, handleMarkETicketDelivered } from "~/server/api/etickets";
import { auth } from "~/server/auth";

/**
 * GET /api/buyer/etickets/[id]
 * Get a specific e-ticket by ID
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

    // Get e-ticket by ID
    const eticket = await handleGetETicketById({
      eticketId: id,
      userId: session.user.id,
    });

    // Mark e-ticket as delivered if not already
    if (!eticket.delivered) {
      await handleMarkETicketDelivered({
        eticketId: id,
      });
    }

    // Return response
    return NextResponse.json({
      success: true,
      data: eticket,
    });
  } catch (error: any) {
    console.error(`Error getting e-ticket with ID ${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to get e-ticket details" 
      },
      { 
        status: error.message === "E-ticket not found" ? 404 : 500 
      },
    );
  }
}
