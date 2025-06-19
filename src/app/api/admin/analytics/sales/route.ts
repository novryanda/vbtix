import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { handleGetAdminSalesAnalytics } from "~/server/api/admin";
import { z } from "zod";

// Validation schema for query parameters
const salesAnalyticsQuerySchema = z.object({
  timeRange: z.enum(["7d", "30d", "90d"]).optional().default("30d")
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
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

    // Fetch sales analytics data
    const salesAnalytics = await handleGetAdminSalesAnalytics(timeRange);

    // Return response
    return NextResponse.json({
      success: true,
      data: salesAnalytics,
    });

  } catch (error) {
    console.error("Error in admin sales analytics API:", error);
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
