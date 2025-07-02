import { NextRequest, NextResponse } from "next/server";
import { handleGetUserOrders } from "~/server/api/buyer-orders";
import { auth } from "~/server/auth";
import { PaymentStatus } from "@prisma/client";
import { z } from "zod";

// Validation schema for query parameters
const ordersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.union([z.nativeEnum(PaymentStatus), z.literal("MANUAL_PENDING")]).optional(),
});

/**
 * GET /api/public/orders
 * Get orders for authenticated users (public endpoint that requires authentication)
 * For guest users, use the order lookup endpoint instead
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication (required for this endpoint)
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required to view orders",
          message: "For guest orders, please use the order lookup feature",
          guestLookupUrl: "/orders/lookup",
        },
        { status: 401 },
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;

    // Parse and validate query parameters
    const parsedParams = ordersQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
    });

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          details: parsedParams.error.format(),
        },
        { status: 400 },
      );
    }

    const { page, limit, status } = parsedParams.data;

    // Get orders for the user
    const result = await handleGetUserOrders({
      userId: session.user.id,
      page,
      limit,
      status,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: result.orders,
      meta: result.meta,
    });
  } catch (error: any) {
    console.error("Error getting user orders:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get orders" },
      { status: 500 },
    );
  }
}
