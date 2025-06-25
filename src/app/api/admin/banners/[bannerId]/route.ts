import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { 
  handleGetBannerById,
  handleUpdateBanner,
  handleDeleteBanner 
} from "~/server/api/admin-banners";

// Validation schema for updating banners
const updateBannerSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long").optional(),
  description: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
  imagePublicId: z.string().min(1, "Image public ID is required").optional(),
  linkUrl: z.string().url("Invalid link URL").optional().nullable(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
});

/**
 * GET /api/admin/banners/[bannerId]
 * Get banner by ID
 */
export async function GET(
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

    // Get banner
    const banner = await handleGetBannerById(bannerId);

    return NextResponse.json({
      success: true,
      data: banner,
    });
  } catch (error: any) {
    console.error("Error getting banner:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get banner",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/banners/[bannerId]
 * Update banner by ID
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
    const parsedData = updateBannerSchema.safeParse(body);
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

    // Update banner
    const banner = await handleUpdateBanner(bannerId, {
      ...parsedData.data,
      startDate: parsedData.data.startDate ? new Date(parsedData.data.startDate) : undefined,
      endDate: parsedData.data.endDate ? new Date(parsedData.data.endDate) : undefined,
      updatedBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: banner,
      message: "Banner updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update banner",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/banners/[bannerId]
 * Delete banner by ID
 */
export async function DELETE(
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

    // Delete banner
    await handleDeleteBanner(bannerId);

    return NextResponse.json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting banner:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete banner",
      },
      { status: 500 }
    );
  }
}
