import { NextRequest, NextResponse } from "next/server";
import { handleGetUserETickets } from "~/server/api/etickets";
import { auth } from "~/server/auth";
import { z } from "zod";

// Validation schema for query parameters
const eTicketsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

/**
 * GET /api/buyer/etickets
 * Get e-tickets for the authenticated user
 * This endpoint requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required to view e-tickets",
          message: "Please log in to view your e-tickets",
        },
        { status: 401 },
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;

    // Parse and validate query parameters
    const parsedParams = eTicketsQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          details: parsedParams.error.format(),
        },
        { status: 400 },
      );
    }

    const { page, limit } = parsedParams.data;

    // Get e-tickets for the user
    const result = await handleGetUserETickets({
      userId: session.user.id,
      page,
      limit,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: result.etickets,
      meta: result.meta,
    });
  } catch (error: any) {
    console.error("Error getting user e-tickets:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get e-tickets" },
      { status: 500 },
    );
  }
}
