import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { 
  handleGetEventStats,
  handleGetRecentEvents,
  handleGetPendingEvents
} from "~/server/api/admin";
import { z } from "zod";

// Validation schema for query parameters
const dashboardQuerySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined)
});

/**
 * GET /api/admin/dashboard/events
 * Get event data for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
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

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const parsedParams = dashboardQuerySchema.safeParse({
      limit: searchParams.get("limit")
    });

    if (!parsedParams.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid parameters", 
          details: parsedParams.error.format() 
        },
        { status: 400 }
      );
    }

    const { limit } = parsedParams.data;

    // Fetch all required event data in parallel for better performance
    const [stats, recentEvents, pendingEvents] = await Promise.all([
      handleGetEventStats(),
      handleGetRecentEvents(limit),
      handleGetPendingEvents(limit)
    ]);

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentEvents,
        pendingEvents
      }
    });
  } catch (error: any) {
    console.error("Error getting event dashboard data:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get event dashboard data" },
      { status: 500 }
    );
  }
}
