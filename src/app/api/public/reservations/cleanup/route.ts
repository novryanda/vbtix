import { NextRequest, NextResponse } from "next/server";
import { handleDeleteReservationsBySession } from "~/server/api/reservations";
import { z } from "zod";

// Validation schema for cleanup request
const cleanupSchema = z.object({
  sessionId: z.string().min(1, { message: "Session ID is required" }),
  reservationIds: z.array(z.string()).optional(),
});

/**
 * POST /api/public/reservations/cleanup
 * Cancel multiple reservations for a session (used when user leaves page)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request body
    const validatedData = cleanupSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validatedData.error.format(),
        },
        { status: 400 },
      );
    }

    const { sessionId, reservationIds } = validatedData.data;

    // Delete reservations (either specific ones or all for the session)
    const result = await handleDeleteReservationsBySession({
      sessionId,
      reservationIds,
    });

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: result.deleted,
        deletedReservations: result.reservations.map((r) => ({
          id: r.id,
          ticketTypeId: r.ticketTypeId,
          quantity: r.quantity,
        })),
      },
      message: `Deleted ${result.deleted} reservations`,
    });
  } catch (error: any) {
    console.error("Error cleaning up reservations:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to cleanup reservations",
      },
      { status: 500 },
    );
  }
}
