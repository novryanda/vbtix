import { NextRequest, NextResponse } from "next/server";
import {
  handleCreateReservation,
  handleGetActiveReservations,
  handleBulkCreateReservations,
} from "~/server/api/reservations";
import {
  createReservationSchema,
  getReservationsSchema,
  bulkReservationSchema,
} from "~/lib/validations/reservation.schema";

/**
 * POST /api/public/reservations
 * Create a new ticket reservation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    try {
      // Check if it's a bulk reservation request
      if (body.reservations && Array.isArray(body.reservations)) {
        // Validate bulk reservation data
        const validatedData = bulkReservationSchema.parse(body);

        // Create bulk reservations
        const result = await handleBulkCreateReservations({
          sessionId: validatedData.sessionId,
          reservations: validatedData.reservations,
          expirationMinutes: validatedData.expirationMinutes,
        });

        return NextResponse.json({
          success: true,
          data: result,
          message: `Created ${result.totalCreated} reservations successfully`,
        });
      } else {
        // Validate single reservation data
        const validatedData = createReservationSchema.parse(body);

        // Create single reservation
        const result = await handleCreateReservation({
          sessionId: validatedData.sessionId,
          ticketTypeId: validatedData.ticketTypeId,
          quantity: validatedData.quantity,
          expirationMinutes: validatedData.expirationMinutes,
        });

        return NextResponse.json({
          success: true,
          data: {
            reservation: result.reservation,
            expiresAt: result.expiresAt,
            remainingSeconds: result.remainingSeconds,
          },
          message: "Reservation created successfully",
        });
      }
    } catch (validationError: any) {
      console.error("POST reservations validation error:", validationError);
      console.error("Request body:", body);
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validationError.errors || validationError.message,
        },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error("Error creating reservation:", error);

    // Handle specific errors
    if (error.message.includes("not found")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }

    if (
      error.message.includes("not available") ||
      error.message.includes("Only")
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }, // Conflict
      );
    }

    if (error.message.includes("already have")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }, // Conflict
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create reservation",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/public/reservations
 * Get active reservations for current user/session
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    try {
      // Validate query parameters
      const validatedParams = getReservationsSchema.parse({
        sessionId,
        page,
        limit,
      });

      // Get active reservations
      const result = await handleGetActiveReservations({
        sessionId: validatedParams.sessionId,
        page: validatedParams.page,
        limit: validatedParams.limit,
      });

      return NextResponse.json({
        success: true,
        data: result.reservations,
        meta: result.meta,
      });
    } catch (validationError: any) {
      console.error("GET reservations validation error:", validationError);
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validationError.errors || validationError.message,
        },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error("Error getting reservations:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get reservations",
      },
      { status: 500 },
    );
  }
}
