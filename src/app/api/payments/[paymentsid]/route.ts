import { NextRequest, NextResponse } from "next/server";
import {
  handleGetPaymentById,
  handleUpdatePayment,
} from "~/server/api/payments";
import { auth } from "~/server/auth";
import { UserRole } from "@prisma/client";

/**
 * GET /api/payments/[paymentsId]
 * Get a single payment by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { paymentsId: string } },
) {
  try {
    const { paymentsId } = params;

    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Handle the request
    const result = await handleGetPaymentById(paymentsId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        {
          status:
            result.error === "Payment not found"
              ? 404
              : result.error === "Forbidden"
                ? 403
                : 400,
        },
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error(`Error in GET /api/payments/${params.paymentsId}:`, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/payments/[paymentsId]
 * Update a payment (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { paymentsId: string } },
) {
  try {
    const { paymentsId } = params;

    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Only admins can update payments
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Parse request body
    const body = await request.json();

    // Handle the request
    const result = await handleUpdatePayment(paymentsId, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, errors: result.errors },
        { status: result.error === "Payment not found" ? 404 : 400 },
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error(`Error in PATCH /api/payments/${params.paymentsId}:`, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
