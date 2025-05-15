import { NextRequest, NextResponse } from "next/server";
import { handleGetEventById } from "~/server/api/buyer-events";

/**
 * GET /api/buyer/events/[id]
 * Get a specific event by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get event by ID or slug
    const event = await handleGetEventById({
      id: id.startsWith("evt_") ? id : undefined,
      slug: !id.startsWith("evt_") ? id : undefined,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error(`Error getting event with ID ${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to get event details" 
      },
      { 
        status: error.message === "Event not found" ? 404 : 500 
      },
    );
  }
}
