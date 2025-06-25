import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { 
  handleGetBanners, 
  handleCreateBanner 
} from "~/server/api/admin-banners";

// Validation schema for query parameters
const bannersQuerySchema = z.object({
  page: z.string().nullable().optional(),
  limit: z.string().nullable().optional(),
  active: z.string().nullable().optional().transform(val => {
    if (val === null || val === undefined || val === "") {
      return undefined;
    }
    return val === "true";
  }),
});

// Validation schema for creating banners
const createBannerSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL"),
  imagePublicId: z.string().min(1, "Image public ID is required"),
  linkUrl: z.string().url("Invalid link URL").optional(),
  isActive: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * GET /api/admin/banners
 * Get all banners with pagination and filters
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;

    // Parse and validate query parameters
    const parsedParams = bannersQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      active: searchParams.get("active"),
    });

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          details: parsedParams.error.format(),
        },
        { status: 400 }
      );
    }

    const { page, limit, active } = parsedParams.data;

    // Get banners
    const result = await handleGetBanners({
      page,
      limit,
      active,
    });

    return NextResponse.json({
      success: true,
      data: result.banners,
      meta: result.meta,
    });
  } catch (error: any) {
    console.error("Error getting banners:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get banners",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/banners
 * Create a new banner
 */
export async function POST(request: NextRequest) {
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
    const parsedData = createBannerSchema.safeParse(body);
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

    // Create banner
    const banner = await handleCreateBanner({
      ...parsedData.data,
      startDate: parsedData.data.startDate ? new Date(parsedData.data.startDate) : undefined,
      endDate: parsedData.data.endDate ? new Date(parsedData.data.endDate) : undefined,
      createdBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: banner,
      message: "Banner created successfully",
    });
  } catch (error: any) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create banner",
      },
      { status: 500 }
    );
  }
}
