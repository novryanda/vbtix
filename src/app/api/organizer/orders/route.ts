import { NextRequest, NextResponse } from "next/server";
import { handleGetOrganizerOrders } from "~/server/api/organizer-orders";
import { auth } from "~/server/auth";
import { UserRole, PaymentStatus } from "@prisma/client";

/**
 * GET /api/organizer/orders
 * Get all orders for the authenticated organizer with pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Only organizers and admins can access this endpoint
    if (
      session.user.role !== UserRole.ORGANIZER &&
      session.user.role !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || undefined;
    const limit = searchParams.get("limit") || undefined;
    const status = searchParams.get("status") as PaymentStatus | undefined;
    const eventId = searchParams.get("eventId") || undefined;
    const search = searchParams.get("search") || undefined;

    // Call business logic
    const result = await handleGetOrganizerOrders({
      userId: session.user.id,
      page,
      limit,
      status,
      eventId,
      search,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: result.orders,
      meta: result.meta,
    });
  } catch (error: any) {
    console.error("Error getting organizer orders:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get orders" },
      { status: 500 },
    );
  }
}
