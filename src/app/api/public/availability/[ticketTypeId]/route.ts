import { NextRequest, NextResponse } from "next/server";
import { handleCheckAvailability } from "~/server/api/reservations";
import { checkAvailabilitySchema } from "~/lib/validations/reservation.schema";

/**
 * GET /api/public/availability/[ticketTypeId]
 * Check ticket availability for a specific ticket type
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketTypeId: string }> }
) {
  try {
    // Await params
    const { ticketTypeId } = await params;

    try {
      // Validate ticket type ID
      const validatedData = checkAvailabilitySchema.parse({
        ticketTypeId,
      });

      // Check availability
      const availability = await handleCheckAvailability({
        ticketTypeId: validatedData.ticketTypeId,
      });

      return NextResponse.json({
        success: true,
        data: availability,
      });
    } catch (validationError: any) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validationError.errors || validationError.message,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error(`Error checking availability for ticket type ${(await params).ticketTypeId}:`, error);

    // Handle specific errors
    if (error.message === "Ticket type not found") {
      return NextResponse.json(
        { success: false, error: "Ticket type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to check ticket availability",
      },
      { status: 500 }
    );
  }
}
