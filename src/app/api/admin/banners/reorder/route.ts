import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { handleReorderBanners } from "~/server/api/admin-banners";

// Validation schema for reordering banners
const reorderSchema = z.object({
  bannerIds: z.array(z.string().min(1, "Banner ID is required")),
});

/**
 * PUT /api/admin/banners/reorder
 * Reorder banners based on drag-and-drop
 */
export async function PUT(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();

    // Validate input
    const parsedData = reorderSchema.safeParse(body);
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

    // Reorder banners
    const banners = await handleReorderBanners(
      parsedData.data.bannerIds,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: banners,
      message: "Banners reordered successfully",
    });
  } catch (error: any) {
    console.error("Error reordering banners:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to reorder banners",
      },
      { status: 500 }
    );
  }
}
