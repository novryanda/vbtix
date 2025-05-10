import { NextRequest, NextResponse } from "next/server";
import { handleGetPayments, handleCreatePayment } from "~/server/api/payments";
import { auth } from "~/server/auth";

/**
 * GET /api/payments
 * Get all payments with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = {
      orderId: searchParams.get("orderId") || undefined,
      status: searchParams.get("status") || undefined,
      gateway: searchParams.get("gateway") || undefined,
      limit: searchParams.has("limit") ? parseInt(searchParams.get("limit") || "10") : 10,
      offset: searchParams.has("offset") ? parseInt(searchParams.get("offset") || "0") : 0,
    };

    // Handle the request
    const result = await handleGetPayments(params);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, errors: result.errors },
        { status: result.error === "Forbidden" ? 403 : 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in GET /api/payments:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments
 * Create a new payment
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Handle the request
    const result = await handleCreatePayment(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, errors: result.errors },
        { status: result.error === "Order not found" ? 404 : result.error === "Forbidden" ? 403 : 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/payments:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}