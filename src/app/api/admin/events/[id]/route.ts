import { NextRequest, NextResponse } from "next/server";
import { 
  handleGetEventById, 
  handleUpdateEvent, 
  handleDeleteEvent,
  handleSetEventFeatured
} from "~/server/api/events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";

/**
 * GET /api/admin/events/[id]
 * Get a single event by ID (admin view with detailed statistics)
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

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

    // Handle the request
    const result = await handleGetEventById(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === "Event not found" ? 404 : 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error(`Error in GET /api/admin/events/${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/events/[id]
 * Update an event (admin can update any event)
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

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

    // Parse request body
    const body = await request.json();

    // Handle the request
    const result = await handleUpdateEvent(id, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, errors: result.errors },
        { status: result.error === "Event not found" ? 404 : 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: result.data,
      message: "Event updated successfully" 
    });
  } catch (error) {
    console.error(`Error in PUT /api/admin/events/${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/events/[id]
 * Delete an event (admin can delete any event)
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

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

    // Handle the request
    const result = await handleDeleteEvent(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === "Event not found" ? 404 : 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: { id },
      message: "Event deleted successfully" 
    });
  } catch (error) {
    console.error(`Error in DELETE /api/admin/events/${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
