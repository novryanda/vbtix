import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { ticketService } from "~/server/services/ticket.service";
import { organizerService } from "~/server/services/organizer.service";
import { uploadImage } from "~/lib/cloudinary-utils";

/**
 * PUT /api/organizer/[id]/tickets/[ticketId]/image
 * Update a ticket image
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; ticketId: string } }
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

    // Only organizers and admins can update ticket images
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id: organizerId, ticketId } = params;

    // Verify organizer
    const organizer = await organizerService.findByUserId(session.user.id);
    if (!organizer || (organizer.id !== organizerId && session.user.role !== UserRole.ADMIN)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get the ticket to verify ownership
    const ticket = await ticketService.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Verify that the ticket belongs to an event organized by this organizer
    if (ticket.ticketType.event.organizer.id !== organizer.id && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Ticket does not belong to this organizer" },
        { status: 403 }
      );
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await uploadImage(buffer, "vbtix/tickets");

    // Update ticket with image URL and public ID
    const updatedTicket = await ticketService.updateTicket(ticketId, {
      imageUrl: result.secure_url,
      imagePublicId: result.public_id,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        id: updatedTicket.id,
        imageUrl: updatedTicket.imageUrl,
        imagePublicId: updatedTicket.imagePublicId,
      },
    });
  } catch (error: any) {
    console.error("Error updating ticket image:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update ticket image" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizer/[id]/tickets/[ticketId]/image
 * Remove a ticket image
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; ticketId: string } }
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

    // Only organizers and admins can delete ticket images
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id: organizerId, ticketId } = params;

    // Verify organizer
    const organizer = await organizerService.findByUserId(session.user.id);
    if (!organizer || (organizer.id !== organizerId && session.user.role !== UserRole.ADMIN)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get the ticket to verify ownership
    const ticket = await ticketService.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Verify that the ticket belongs to an event organized by this organizer
    if (ticket.ticketType.event.organizer.id !== organizer.id && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Ticket does not belong to this organizer" },
        { status: 403 }
      );
    }

    // Update ticket to remove image URL and public ID
    const updatedTicket = await ticketService.updateTicket(ticketId, {
      imageUrl: null,
      imagePublicId: null,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        id: updatedTicket.id,
      },
    });
  } catch (error: any) {
    console.error("Error removing ticket image:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to remove ticket image" },
      { status: 500 }
    );
  }
}
