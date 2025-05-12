import { NextRequest, NextResponse } from "next/server";
import { handleGetOrganizerInventorySummary } from "~/server/api/inventory";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";

/**
 * GET /api/organizer/inventory
 * Get inventory summary for all events of the authenticated organizer
 */
export async function GET(_request: NextRequest) {
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

    // Call business logic
    const inventorySummary = await handleGetOrganizerInventorySummary({
      userId: session.user.id,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: inventorySummary,
    });
  } catch (error: any) {
    console.error("Error getting organizer inventory summary:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get inventory summary",
      },
      { status: 500 },
    );
  }
}
