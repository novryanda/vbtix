import { NextRequest, NextResponse } from "next/server";
import { handleSetEventFeatured } from "~/server/api/events";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";

/**
 * POST /api/admin/events/[id]/featured
 * Set an event as featured or unfeatured
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

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
    const { featured } = await request.json();

    if (typeof featured !== 'boolean') {
      return NextResponse.json(
        { success: false, error: "Featured status must be a boolean" },
        { status: 400 }
      );
    }

    // Handle the request
    const result = await handleSetEventFeatured(id, featured);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === "Event not found" ? 404 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: featured ? "Event set as featured" : "Event removed from featured"
    });
  } catch (error) {
    console.error(`Error in POST /api/admin/events/${params.id}/featured:`, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
