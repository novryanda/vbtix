import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { handleUpdateBannerStatus } from "~/server/api/admin-banners";

// Validation schema for status update
const statusUpdateSchema = z.object({
  isActive: z.boolean(),
});

/**
 * PUT /api/admin/banners/[bannerId]/status
 * Update banner status (activate/deactivate)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bannerId: string }> }
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

    // Only admins can access this endpoint
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { bannerId } = await params;

    // Validate bannerId exists
    if (!bannerId) {
      return NextResponse.json(
        { success: false, error: "Banner ID is required" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const parsedData = statusUpdateSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: parsedData.error.format(),
        },
        { status: 400 }
      );
    }

    // Update banner status
    const banner = await handleUpdateBannerStatus(
      bannerId, 
      parsedData.data.isActive,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: banner,
      message: `Banner ${parsedData.data.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error: any) {
    console.error("Error updating banner status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update banner status",
      },
      { status: 500 }
    );
  }
}
