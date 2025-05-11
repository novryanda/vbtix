import { NextRequest, NextResponse } from "next/server";
import { handleGetOrganizerSalesReport } from "~/server/api/sales";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { z } from "zod";

// Validation schema for query parameters
const salesQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  eventId: z.string().optional(),
  groupBy: z.enum(["day", "week", "month"]).optional().default("day"),
});

/**
 * GET /api/organizer/sales
 * Get sales report for the authenticated organizer
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

    // Parse and validate query parameters
    const parsedParams = salesQuerySchema.safeParse({
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      eventId: searchParams.get("eventId"),
      groupBy: searchParams.get("groupBy"),
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

    const { startDate, endDate, eventId, groupBy } = parsedParams.data;

    // Call business logic
    const salesReport = await handleGetOrganizerSalesReport({
      userId: session.user.id,
      startDate,
      endDate,
      eventId,
      groupBy,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: salesReport,
    });
  } catch (error: any) {
    console.error("Error getting organizer sales report:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get sales report" },
      { status: 500 },
    );
  }
}
