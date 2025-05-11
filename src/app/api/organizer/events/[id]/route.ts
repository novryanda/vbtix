import { NextRequest, NextResponse } from "next/server";
import {
  handleGetOrganizerEventById,
  handleUpdateOrganizerEvent,
  handleDeleteOrganizerEvent,
} from "~/server/api/organizer-events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { updateEventSchema } from "~/lib/validations/event.schema";

/**
 * GET /api/organizer/events/[id]
 * Get event details for the authenticated organizer
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
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

    // Only organizers and admins can access this endpoint
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = params;

    // Call business logic
    const event = await handleGetOrganizerEventById({
      userId: session.user.id,
      eventId: id,
    });

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error(`Error fetching event with ID ${params.id}:`, error);

    // Handle specific errors
    if (error.message === "Event not found") {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 },
      );
    }

    if (error.message === "Event does not belong to this organizer") {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to access this event",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch event details",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/organizer/events/[id]
 * Update an event for the authenticated organizer
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
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

    // Only organizers and admins can update events
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = params;
    const body = await req.json();

    try {
      // Validate input using Zod schema
      const validatedData = updateEventSchema.parse(body);

      // Call business logic
      const updatedEvent = await handleUpdateOrganizerEvent({
        userId: session.user.id,
        eventId: id,
        eventData: validatedData,
      });

      return NextResponse.json({
        success: true,
        data: updatedEvent,
      });
    } catch (validationError: any) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validationError.errors || validationError,
        },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error(`Error updating event with ID ${params.id}:`, error);

    // Handle specific errors
    if (error.message === "Event not found") {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 },
      );
    }

    if (error.message === "Event does not belong to this organizer") {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to update this event",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to update event" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/organizer/events/[id]
 * Delete an event for the authenticated organizer
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
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

    // Only organizers and admins can delete events
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = params;

    // Call business logic
    await handleDeleteOrganizerEvent({
      userId: session.user.id,
      eventId: id,
    });

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error: any) {
    console.error(`Error deleting event with ID ${params.id}:`, error);

    // Handle specific errors
    if (error.message === "Event not found") {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 },
      );
    }

    if (error.message === "Event does not belong to this organizer") {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to delete this event",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete event" },
      { status: 500 },
    );
  }
}
