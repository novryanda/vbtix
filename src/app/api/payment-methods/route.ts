import { NextRequest, NextResponse } from "next/server";
import { paymentMethodService } from "~/server/services/payment-method.service";

/**
 * GET /api/payment-methods
 * Get all active payment methods
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const paymentMethods = includeInactive
      ? await paymentMethodService.findAll()
      : await paymentMethodService.findAllActive();

    return NextResponse.json({
      success: true,
      data: paymentMethods,
    });
  } catch (error: any) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch payment methods",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
