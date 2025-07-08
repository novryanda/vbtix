import { NextRequest, NextResponse } from "next/server";
import {
  handleGetTicketTypeById,
  handleUpdateTicketType,
  handleDeleteTicketType,
} from "~/server/api/tickets";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { updateTicketTypeSchema, deleteTicketTypeSchema } from "~/lib/validations/ticket.schema";

/**
 * GET /api/organizer/[organizerId]/tickets/[ticketsId]
 * Get ticket type details for the authenticated organizer
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ organizerId: string; ticketsId: string }> },
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

    const { ticketsId } = await params;

    // Call business logic
    const ticketType = await handleGetTicketTypeById({
      userId: session.user.id,
      ticketTypeId: ticketsId,
    });

    return NextResponse.json({
      success: true,
      data: ticketType,
    });
  } catch (error: any) {
    const { ticketsId } = await params;
    console.error(`Error fetching ticket type with ID ${ticketsId}:`, error);

    // Handle specific errors
    if (error.message === "Ticket type not found") {
      return NextResponse.json(
        { success: false, error: "Ticket type not found" },
        { status: 404 },
      );
    }

    if (
      error.message === "Ticket type does not belong to this organizer's event"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to access this ticket type",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch ticket type details",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/organizer/[organizerId]/tickets/[ticketsId]
 * Update a ticket type for the authenticated organizer
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ organizerId: string; ticketsId: string }> },
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

    // Only organizers and admins can update ticket types
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { ticketsId } = await params;
    const body = await req.json();

    try {
      // Validate input using Zod schema
      const validatedData = updateTicketTypeSchema.parse(body);

      // Call business logic
      const updatedTicketType = await handleUpdateTicketType({
        userId: session.user.id,
        ticketTypeId: ticketsId,
        ticketTypeData: validatedData,
      });

      return NextResponse.json({
        success: true,
        data: updatedTicketType,
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
    const { ticketsId } = await params;
    console.error(`Error updating ticket type with ID ${ticketsId}:`, error);

    // Handle specific errors
    if (error.message === "Ticket type not found") {
      return NextResponse.json(
        { success: false, error: "Ticket type not found" },
        { status: 404 },
      );
    }

    if (
      error.message === "Ticket type does not belong to this organizer's event"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to update this ticket type",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update ticket type",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/organizer/[organizerId]/tickets/[ticketsId]
 * Soft delete a ticket type for the authenticated organizer
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ organizerId: string; ticketsId: string }> },
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

    // Only organizers and admins can delete ticket types
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { ticketsId } = await params;

    // Parse request body for deletion reason
    let reason: string | undefined;
    try {
      const body = await req.json();
      const validatedData = deleteTicketTypeSchema.parse({ id: ticketsId, ...body });
      reason = validatedData.reason;
    } catch {
      // If no body or invalid body, proceed without reason
    }

    // Call business logic for soft delete
    const deletedTicketType = await handleDeleteTicketType({
      userId: session.user.id,
      ticketTypeId: ticketsId,
      reason,
    });

    return NextResponse.json({
      success: true,
      message: "Ticket type deleted successfully",
      data: deletedTicketType,
    });
  } catch (error: any) {
    const { ticketsId } = await params;
    console.error(`Error deleting ticket type with ID ${ticketsId}:`, error);

    // Handle specific errors
    if (error.message === "Ticket type not found or already deleted") {
      return NextResponse.json(
        { success: false, error: "Ticket type not found or already deleted" },
        { status: 404 },
      );
    }

    if (
      error.message === "Ticket type does not belong to this organizer's event"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to delete this ticket type",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete ticket type",
      },
      { status: 500 },
    );
  }
}
