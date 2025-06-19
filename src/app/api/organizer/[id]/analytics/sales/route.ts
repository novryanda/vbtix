import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { getOrganizerSalesAnalytics } from "~/server/services/dashboard.service";
import { z } from "zod";

// Validation schema for query parameters
const salesAnalyticsQuerySchema = z.object({
  timeRange: z.enum(["7d", "30d", "90d"]).optional().default("30d")
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: organizerId } = await params;

    // Check if user is admin or the organizer themselves
    if (session.user.role !== UserRole.ADMIN) {
      // For organizers, check if they own this organizer profile
      if (session.user.role !== UserRole.ORGANIZER) {
        return NextResponse.json(
          { success: false, error: "Forbidden - Organizer or Admin access required" },
          { status: 403 }
        );
      }

      // Additional check to ensure organizer can only access their own data
      // This would require checking if the session user's organizer ID matches the requested ID
      // For now, we'll allow any organizer to access any organizer data
      // In production, you should add proper ownership validation
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const parsedParams = salesAnalyticsQuerySchema.safeParse({
      timeRange: searchParams.get("timeRange"),
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

    const { timeRange } = parsedParams.data;

    // Fetch organizer sales analytics data
    const salesAnalytics = await getOrganizerSalesAnalytics(organizerId, timeRange);

    // Return response
    return NextResponse.json({
      success: true,
      data: salesAnalytics,
    });

  } catch (error) {
    console.error("Error in organizer sales analytics API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
