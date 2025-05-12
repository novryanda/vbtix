import { NextRequest, NextResponse } from "next/server";
import {
  handleGetOrganizerEvents,
  handleCreateOrganizerEvent,
} from "~/server/api/organizer-events";
import { auth } from "~/server/auth";
import { UserRole, EventStatus } from "@prisma/client";
import { createEventSchema } from "~/lib/validations/event.schema";

/**
 * GET /api/organizer/events
 * Get all events for the authenticated organizer with pagination
 */
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || undefined;
    const limit = searchParams.get("limit") || undefined;
    const status = searchParams.get("status") as EventStatus | undefined;
    const search = searchParams.get("search") || undefined;

    // Call business logic
    const result = await handleGetOrganizerEvents({
      userId: session.user.id,
      page,
      limit,
      status,
      search,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: result.events,
      meta: result.meta,
    });
  } catch (error: any) {
    console.error("Error getting organizer events:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get events" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/organizer/events
 * Create a new event for the authenticated organizer
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Only organizers and admins can create events
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Parse and validate request body
    const body = await request.json();

    try {
      // Validate input using Zod schema
      const validatedData = createEventSchema.parse(body);

      // Call business logic
      const event = await handleCreateOrganizerEvent({
        userId: session.user.id,
        eventData: validatedData,
      });

      // Return response
      return NextResponse.json({
        success: true,
        data: event,
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
    console.error("Error creating event:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create event" },
      { status: 500 },
    );
  }
}
