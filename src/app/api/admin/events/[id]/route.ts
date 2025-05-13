import { NextRequest, NextResponse } from "next/server";
import { handleGetEventById, handleUpdateEvent, handleDeleteEvent } from "~/server/api/events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { updateEventSchema } from "~/lib/validations/event.schema";

/**
 * GET /api/admin/events/[eventid]
 * Get event by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can access this endpoint
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = params;
    const event = await handleGetEventById(id);

    return NextResponse.json({
      success: true,
      data: event
    });
  } catch (error: any) {
    console.error(`Error getting event ${params.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get event"
      },
      { status: error.message === "Event not found" ? 404 : 500 }
    );
  }
}

/**
 * PUT /api/admin/events/[eventid]
 * Update event by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can update events
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    try {
      // Validate input using Zod schema
      const validatedData = updateEventSchema.parse(body);

      // Update event
      const updatedEvent = await handleUpdateEvent(id, validatedData, session.user.id);

      return NextResponse.json({
        success: true,
        data: updatedEvent
      });
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: validationError },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error(`Error updating event ${params.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update event"
      },
      { status: error.message === "Event not found" ? 404 : 500 }
    );
  }
}

/**
 * DELETE /api/admin/events/[eventid]
 * Delete event by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admins can delete events
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = params;
    await handleDeleteEvent(id, session.user.id);

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully"
    });
  } catch (error: any) {
    console.error(`Error deleting event ${params.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete event"
      },
      { status: error.message === "Event not found" ? 404 : 500 }
    );
  }
}
