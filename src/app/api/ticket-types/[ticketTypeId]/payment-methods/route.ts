import { NextRequest, NextResponse } from "next/server";
import { paymentMethodService } from "~/server/services/payment-method.service";

/**
 * GET /api/ticket-types/[ticketTypeId]/payment-methods
 * Get allowed payment methods for a specific ticket type
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketTypeId: string }> }
) {
  try {
    const { ticketTypeId } = await params;

    if (!ticketTypeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Ticket type ID is required",
        },
        { status: 400 }
      );
    }

    const allowedPaymentMethods = await paymentMethodService.findAllowedForTicketType(ticketTypeId);

    return NextResponse.json({
      success: true,
      data: allowedPaymentMethods,
    });
  } catch (error: any) {
    console.error("Error fetching allowed payment methods:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch allowed payment methods",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
