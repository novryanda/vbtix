import { NextRequest, NextResponse } from "next/server";
import {
  handleGetEventById,
  handleUpdateEvent,
  handleDeleteEvent,
} from "~/server/api/events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { updateEventSchema } from "~/lib/validations/event.schema";

/**
 * GET /api/admin/events/[eventid]
 * Get event by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { eventid: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { eventid: id } = params;
    const event = await handleGetEventById(id);

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error(`Error getting event ${params?.eventid}:`, error); // Gunakan optional chaining
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get event",
      },
      { status: error.message === "Event not found" ? 404 : 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { eventid: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { eventid: id } = params;

    const body = await request.json();

    try {
      const validatedData = updateEventSchema.parse(body);
      const updatedEvent = await handleUpdateEvent(
        id,
        validatedData,
        session.user.id,
      );

      return NextResponse.json({
        success: true,
        data: updatedEvent,
      });
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: validationError },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error(`Error updating event ${params?.eventid}:`, error); // Gunakan optional chaining
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update event",
      },
      { status: error.message === "Event not found" ? 404 : 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventid: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { eventid } = params;
    await handleDeleteEvent(eventid, session.user.id);

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error: any) {
    console.error(`Error deleting event ${params?.eventid}:`, error); // Gunakan optional chaining
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete event",
      },
      { status: error.message === "Event not found" ? 404 : 500 },
    );
  }
}