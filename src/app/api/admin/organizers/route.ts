import { NextRequest, NextResponse } from "next/server";
import { handleGetOrganizers } from "~/server/api/admin-organizers";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";

/**
 * GET /api/admin/organizers
 * Get all organizers with pagination and filters
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const verified = searchParams.has("verified")
      ? searchParams.get("verified") === "true"
      : undefined;

    console.log("API query parameters:", { page, limit, search, verified });
    console.log("Raw verified param:", searchParams.get("verified"));

    // Call business logic
    const result = await handleGetOrganizers({
      page,
      limit,
      search,
      verified
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: result.organizers,
      meta: result.meta
    });
  } catch (error: any) {
    console.error("Error getting organizers:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get organizers" },
      { status: 500 }
    );
  }
}
