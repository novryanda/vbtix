import { NextRequest, NextResponse } from "next/server";
import { handleGetEventStatistics } from "~/server/api/events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";

/**
 * GET /api/admin/events/[id]/statistics
 * Get event statistics
 */
export async function GET(
  request: NextRequest,
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

    // Only admins can access statistics
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = params;
    const statistics = await handleGetEventStatistics(id);
    
    return NextResponse.json({
      success: true,
      data: statistics
    });
  } catch (error: any) {
    console.error(`Error getting statistics for event ${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to get event statistics" 
      },
      { status: error.message === "Event not found" ? 404 : 500 }
    );
  }
}
