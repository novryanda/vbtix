import { NextRequest, NextResponse } from "next/server";
import { handleGetEvents } from "~/server/api/events";
import { auth } from "~/server/auth";
import { EventStatus, UserRole } from "@prisma/client";

/**
 * GET /api/admin/events/pending
 * Get all events pending review
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

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = {
      status: EventStatus.PENDING_REVIEW,
      limit: searchParams.has("limit") ? parseInt(searchParams.get("limit") || "10") : 10,
      offset: searchParams.has("offset") ? parseInt(searchParams.get("offset") || "0") : 0,
    };

    // Handle the request
    const result = await handleGetEvents(params);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, errors: result.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in GET /api/admin/events/pending:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
