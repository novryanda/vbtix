import { NextRequest, NextResponse } from "next/server";
import { handleGetOrganizerStatistics } from "~/server/api/admin-organizers";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";

/**
 * GET /api/admin/organizers/stats
 * Get organizer statistics
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

    // Call business logic
    const stats = await handleGetOrganizerStatistics();

    // Return response
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error("Error getting organizer statistics:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get organizer statistics" },
      { status: 500 }
    );
  }
}
