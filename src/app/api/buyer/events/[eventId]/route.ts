import { NextRequest, NextResponse } from "next/server";
import { handleGetEventById } from "~/server/api/buyer-events";

/**
 * GET /api/buyer/events/[eventId]
 * Get a specific event by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    // Get event ID from params - await params to avoid "sync-dynamic-apis" error
    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 },
      );
    }

    // Get event details
    const event = await handleGetEventById({ id: eventId });

    // Return response
    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error("Error getting event:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get event",
      },
      {
        status: error.message === "Event not found" ? 404 : 500,
      },
    );
  }
}
