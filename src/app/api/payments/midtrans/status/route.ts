import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { getMidtransPaymentStatus } from "~/server/integrations/payment/midtrans";
import { z } from "zod";

// Define validation schema
const checkPaymentStatusSchema = z.object({
  paymentId: z.string(),
});

/**
 * POST /api/payments/midtrans/status
 * Check the status of a Midtrans payment
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

    // Validate input data
    const result = checkPaymentStatusSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.errors },
        { status: 400 }
      );
    }

    // Check the payment status
    const statusResult = await getMidtransPaymentStatus(result.data.paymentId);

    if (!statusResult.success) {
      return NextResponse.json(
        { success: false, error: statusResult.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        status: statusResult.status,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/payments/midtrans/status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
