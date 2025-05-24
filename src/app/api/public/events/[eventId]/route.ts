import { NextRequest, NextResponse } from "next/server";
import { handleGetEventById } from "~/server/api/buyer-events";

/**
 * GET /api/public/events/[eventId]
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

    // Get event details - try by ID first, then by slug
    let event;
    try {
      // First try as ID (if it looks like a CUID)
      if (eventId.match(/^c[a-z0-9]{24}$/)) {
        console.log(`Trying to find event by ID: ${eventId}`);
        event = await handleGetEventById({ id: eventId });
      } else {
        // Otherwise try as slug
        console.log(`Trying to find event by slug: ${eventId}`);
        event = await handleGetEventById({ slug: eventId });
      }
    } catch (error) {
      console.log(
        `First attempt failed, trying alternative lookup for: ${eventId}`,
      );
      // If ID lookup fails, try slug lookup
      try {
        if (eventId.match(/^c[a-z0-9]{24}$/)) {
          // If we tried ID first, now try slug
          console.log(`Fallback: trying slug lookup for: ${eventId}`);
          event = await handleGetEventById({ slug: eventId });
        } else {
          // If we tried slug first, now try ID
          console.log(`Fallback: trying ID lookup for: ${eventId}`);
          event = await handleGetEventById({ id: eventId });
        }
      } catch (slugError) {
        console.error(`Both lookups failed for: ${eventId}`, error);
        // If both fail, throw the original error
        throw error;
      }
    }

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
