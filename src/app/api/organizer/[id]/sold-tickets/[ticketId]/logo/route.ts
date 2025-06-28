import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "~/server/db";
import { organizerService } from "~/server/services/organizer.service";

/**
 * PUT /api/organizer/[id]/sold-tickets/[ticketId]/logo
 * Update individual ticket logo
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get params
    const { id: organizerId, ticketId } = await params;
    const body = await request.json();

    // Validate organizer access
    const organizer = await organizerService.findByUserId(session.user.id);
    if (!organizer || organizer.id !== organizerId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Validate request body
    const { logoUrl, logoPublicId } = body;
    if (!logoUrl || !logoPublicId) {
      return NextResponse.json(
        { success: false, error: "Logo URL and public ID are required" },
        { status: 400 }
      );
    }

    // Verify ticket belongs to organizer
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        transaction: {
          event: {
            organizerId: organizer.id,
          },
        },
      },
      include: {
        transaction: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found or access denied" },
        { status: 404 }
      );
    }

    // Update ticket with logo
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        logoUrl,
        logoPublicId,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTicket,
      message: "Ticket logo updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating ticket logo:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update ticket logo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizer/[id]/sold-tickets/[ticketId]/logo
 * Remove individual ticket logo
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get params
    const { id: organizerId, ticketId } = await params;

    // Validate organizer access
    const organizer = await organizerService.findByUserId(session.user.id);
    if (!organizer || organizer.id !== organizerId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Verify ticket belongs to organizer
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        transaction: {
          event: {
            organizerId: organizer.id,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found or access denied" },
        { status: 404 }
      );
    }

    // Remove logo from ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        logoUrl: null,
        logoPublicId: null,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTicket,
      message: "Ticket logo removed successfully",
    });
  } catch (error: any) {
    console.error("Error removing ticket logo:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to remove ticket logo" },
      { status: 500 }
    );
  }
}
