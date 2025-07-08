import { NextRequest, NextResponse } from "next/server";
import {
  handleBulkTicketTypeOperation,
  handleGetTicketTypesWithFilters,
} from "~/server/api/tickets";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { 
  bulkTicketTypeOperationSchema, 
  ticketTypeFilterSchema 
} from "~/lib/validations/ticket.schema";

/**
 * POST /api/organizer/[organizerId]/tickets/bulk
 * Perform bulk operations on ticket types
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    // Only organizers and admins can perform bulk operations
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const body = await req.json();

    try {
      // Validate input using Zod schema
      const validatedData = bulkTicketTypeOperationSchema.parse(body);

      // Call business logic
      const result = await handleBulkTicketTypeOperation({
        userId: session.user.id,
        ticketTypeIds: validatedData.ticketTypeIds,
        operation: validatedData.operation,
        reason: validatedData.reason,
      });

      return NextResponse.json({
        success: true,
        message: `Bulk ${validatedData.operation} operation completed successfully`,
        data: result,
      });
    } catch (validationError: any) {
      // Handle Zod validation errors
      if (validationError.errors) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation error",
            details: validationError.errors,
          },
          { status: 400 },
        );
      }
      throw validationError;
    }
  } catch (error: any) {
    console.error("Error performing bulk operation on ticket types:", error);

    // Handle specific errors
    if (error.message === "Some ticket types not found or access denied") {
      return NextResponse.json(
        { 
          success: false, 
          error: "Some ticket types not found or you don't have permission to access them" 
        },
        { status: 403 },
      );
    }

    if (error.message === "At least one ticket type must be selected") {
      return NextResponse.json(
        { success: false, error: "At least one ticket type must be selected" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to perform bulk operation",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/organizer/[organizerId]/tickets/bulk
 * Get ticket types with enhanced filtering and pagination
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    // Only organizers and admins can view ticket types
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    
    // Parse query parameters
    const queryParams = {
      eventId: searchParams.get("eventId") || undefined,
      search: searchParams.get("search") || undefined,
      isVisible: searchParams.get("isVisible") ? searchParams.get("isVisible") === "true" : undefined,
      priceMin: searchParams.get("priceMin") ? parseFloat(searchParams.get("priceMin")!) : undefined,
      priceMax: searchParams.get("priceMax") ? parseFloat(searchParams.get("priceMax")!) : undefined,
      status: searchParams.get("status") as "active" | "inactive" | "deleted" | undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20,
      includeDeleted: searchParams.get("includeDeleted") === "true",
    };

    try {
      // Validate query parameters
      const validatedParams = ticketTypeFilterSchema.parse(queryParams);

      // Call business logic
      const result = await handleGetTicketTypesWithFilters({
        userId: session.user.id,
        ...validatedParams,
      });

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (validationError: any) {
      // Handle Zod validation errors
      if (validationError.errors) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid query parameters",
            details: validationError.errors,
          },
          { status: 400 },
        );
      }
      throw validationError;
    }
  } catch (error: any) {
    console.error("Error fetching ticket types with filters:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch ticket types",
      },
      { status: 500 },
    );
  }
}
