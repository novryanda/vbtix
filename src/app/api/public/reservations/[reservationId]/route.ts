import { NextRequest, NextResponse } from "next/server";
import {
  handleGetReservation,
  handleCancelReservation,
  handleExtendReservation,
} from "~/server/api/reservations";
import {
  cancelReservationSchema,
  extendReservationSchema,
} from "~/lib/validations/reservation.schema";

/**
 * GET /api/public/reservations/[reservationId]
 * Get a specific reservation by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> },
) {
  try {
    // Await params
    const { reservationId } = await params;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Get reservation
    const result = await handleGetReservation({
      reservationId,
      sessionId,
    });

    return NextResponse.json({
      success: true,
      data: {
        reservation: result.reservation,
        remainingSeconds: result.remainingSeconds,
        isExpired: result.isExpired,
      },
    });
  } catch (error: any) {
    console.error(
      `Error getting reservation ${(await params).reservationId}:`,
      error,
    );

    // Handle specific errors
    if (error.message === "Reservation not found") {
      return NextResponse.json(
        { success: false, error: "Reservation not found" },
        { status: 404 },
      );
    }

    if (error.message.includes("permission")) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to view this reservation",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get reservation",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/public/reservations/[reservationId]
 * Cancel a reservation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> },
) {
  try {
    // Await params
    const { reservationId } = await params;

    const body = await request.json();

    try {
      // Validate request data
      const validatedData = cancelReservationSchema.parse({
        reservationId,
        sessionId: body.sessionId,
      });

      // Cancel reservation
      const cancelledReservation = await handleCancelReservation({
        reservationId: validatedData.reservationId,
        sessionId: validatedData.sessionId,
      });

      return NextResponse.json({
        success: true,
        data: cancelledReservation,
        message: "Reservation cancelled successfully",
      });
    } catch (validationError: any) {
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
    console.error(
      `Error cancelling reservation ${(await params).reservationId}:`,
      error,
    );

    // Handle specific errors
    if (error.message === "Reservation not found") {
      return NextResponse.json(
        { success: false, error: "Reservation not found" },
        { status: 404 },
      );
    }

    if (error.message.includes("permission")) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to cancel this reservation",
        },
        { status: 403 },
      );
    }

    if (error.message.includes("not active")) {
      return NextResponse.json(
        { success: false, error: "Reservation is not active" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to cancel reservation",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/public/reservations/[reservationId]
 * Extend reservation time
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> },
) {
  try {
    // Await params
    const { reservationId } = await params;

    const body = await request.json();

    try {
      // Validate request data
      const validatedData = extendReservationSchema.parse({
        reservationId,
        additionalMinutes: body.additionalMinutes,
        sessionId: body.sessionId,
      });

      // Extend reservation
      const result = await handleExtendReservation({
        reservationId: validatedData.reservationId,
        additionalMinutes: validatedData.additionalMinutes,
        sessionId: validatedData.sessionId,
      });

      return NextResponse.json({
        success: true,
        data: {
          reservation: result.reservation,
          newExpiresAt: result.newExpiresAt,
          remainingSeconds: result.remainingSeconds,
        },
        message: `Reservation extended by ${validatedData.additionalMinutes} minutes`,
      });
    } catch (validationError: any) {
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
    console.error(
      `Error extending reservation ${(await params).reservationId}:`,
      error,
    );

    // Handle specific errors
    if (error.message === "Reservation not found") {
      return NextResponse.json(
        { success: false, error: "Reservation not found" },
        { status: 404 },
      );
    }

    if (error.message.includes("permission")) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to extend this reservation",
        },
        { status: 403 },
      );
    }

    if (error.message.includes("expired") || error.message.includes("active")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to extend reservation",
      },
      { status: 500 },
    );
  }
}
