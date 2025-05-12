import { NextRequest, NextResponse } from "next/server";
import { 
  handleGetTicketTypeById, 
  handleUpdateTicketType, 
  handleDeleteTicketType 
} from "~/server/api/tickets";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { updateTicketTypeSchema } from "~/lib/validations/ticket.schema";

/**
 * GET /api/organizer/tickets/[id]
 * Get ticket type details for the authenticated organizer
 */
export async function GET(
  _req: NextRequest,
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

    // Only organizers and admins can access this endpoint
    if (session.user.role !== UserRole.ORGANIZER && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = params;
    
    // Call business logic
    const ticketType = await handleGetTicketTypeById({
      userId: session.user.id,
      ticketTypeId: id
    });
    
    return NextResponse.json({ 
      success: true, 
      data: ticketType
    });
  } catch (error: any) {
    console.error(`Error fetching ticket type with ID ${params.id}:`, error);
    
    // Handle specific errors
    if (error.message === "Ticket type not found") {
      return NextResponse.json(
        { success: false, error: "Ticket type not found" },
        { status: 404 }
      );
    }
    
    if (error.message === "Ticket type does not belong to this organizer's event") {
      return NextResponse.json(
        { success: false, error: "You don't have permission to access this ticket type" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch ticket type details" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/organizer/tickets/[id]
 * Update a ticket type for the authenticated organizer
 */
export async function PUT(
  req: NextRequest,
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

    // Only organizers and admins can update ticket types
    if (session.user.role !== UserRole.ORGANIZER && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json();
    
    try {
      // Validate input using Zod schema
      const validatedData = updateTicketTypeSchema.parse(body);
      
      // Call business logic
      const updatedTicketType = await handleUpdateTicketType({
        userId: session.user.id,
        ticketTypeId: id,
        ticketTypeData: validatedData
      });
      
      return NextResponse.json({ 
        success: true, 
        data: updatedTicketType
      });
    } catch (validationError: any) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Validation error", 
          details: validationError.errors || validationError 
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error(`Error updating ticket type with ID ${params.id}:`, error);
    
    // Handle specific errors
    if (error.message === "Ticket type not found") {
      return NextResponse.json(
        { success: false, error: "Ticket type not found" },
        { status: 404 }
      );
    }
    
    if (error.message === "Ticket type does not belong to this organizer's event") {
      return NextResponse.json(
        { success: false, error: "You don't have permission to update this ticket type" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update ticket type" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizer/tickets/[id]
 * Delete a ticket type for the authenticated organizer
 */
export async function DELETE(
  _req: NextRequest,
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

    // Only organizers and admins can delete ticket types
    if (session.user.role !== UserRole.ORGANIZER && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = params;
    
    // Call business logic
    await handleDeleteTicketType({
      userId: session.user.id,
      ticketTypeId: id
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Ticket type deleted successfully" 
    });
  } catch (error: any) {
    console.error(`Error deleting ticket type with ID ${params.id}:`, error);
    
    // Handle specific errors
    if (error.message === "Ticket type not found") {
      return NextResponse.json(
        { success: false, error: "Ticket type not found" },
        { status: 404 }
      );
    }
    
    if (error.message === "Ticket type does not belong to this organizer's event") {
      return NextResponse.json(
        { success: false, error: "You don't have permission to delete this ticket type" },
        { status: 403 }
      );
    }
    
    if (error.message === "Cannot delete ticket type with sold tickets") {
      return NextResponse.json(
        { success: false, error: "Cannot delete ticket type with sold tickets" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete ticket type" },
      { status: 500 }
    );
  }
}
