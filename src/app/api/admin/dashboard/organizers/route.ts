import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { 
  handleGetOrganizerStats,
  handleGetRecentOrganizers,
  handleGetPendingOrganizers
} from "~/server/api/admin";
import { z } from "zod";

// Validation schema for query parameters
const dashboardQuerySchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined)
});

/**
 * GET /api/admin/dashboard/organizers
 * Get organizer data for admin dashboard
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

    // Fetch all required organizer data in parallel for better performance
    const [stats, recentOrganizers, pendingOrganizers] = await Promise.all([
      handleGetOrganizerStats(),
      handleGetRecentOrganizers(limit),
      handleGetPendingOrganizers(limit)
    ]);

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentOrganizers,
        pendingOrganizers
      }
    });
  } catch (error: any) {
    console.error("Error getting organizer dashboard data:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get organizer dashboard data" },
      { status: 500 }
    );
  }
}
