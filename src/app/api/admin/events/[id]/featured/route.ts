import { NextRequest, NextResponse } from "next/server";
import { handleSetEventFeatured } from "~/server/api/events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const featuredSchema = z.object({
  featured: z.boolean()
});

/**
 * POST /api/admin/events/[eventid]/featured
 * Set event as featured/unfeatured
 */
export async function POST(
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

    // Only admins can set featured status
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    try {
      // Validate input
      const { featured } = featuredSchema.parse(body);

      // Update featured status
      const result = await handleSetEventFeatured(id, featured);

      return NextResponse.json({
        success: true,
        data: result
      });
    } catch (validationError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: validationError },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error(`Error setting featured status for event ${params.id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update featured status"
      },
      { status: error.message === "Event not found" ? 404 : 500 }
    );
  }
}

/**
 * PUT /api/admin/events/[eventid]/featured
 * Set event as featured/unfeatured (alternative to POST for consistency with documentation)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Reuse the same implementation as POST
  return POST(request, { params });
}
