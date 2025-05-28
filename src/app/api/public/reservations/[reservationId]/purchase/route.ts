import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { handlePurchaseFromReservation } from "~/server/api/buyer-tickets";
import { z } from "zod";

/**
 * Schema for purchasing from reservation
 */
const purchaseFromReservationSchema = z.object({
  sessionId: z.string().min(1, { message: "Session ID is required" }),
  buyerInfo: z.object({
    fullName: z.string().min(1, { message: "Full name is required" }),
    identityType: z.string().min(1, { message: "Identity type is required" }),
    identityNumber: z
      .string()
      .min(1, { message: "Identity number is required" }),
    email: z.string().email({ message: "Valid email is required" }),
    whatsapp: z.string().min(1, { message: "WhatsApp number is required" }),
  }),
  ticketHolders: z
    .array(
      z.object({
        fullName: z
          .string()
          .min(1, { message: "Ticket holder full name is required" }),
        identityType: z
          .string()
          .min(1, { message: "Ticket holder identity type is required" }),
        identityNumber: z
          .string()
          .min(1, { message: "Ticket holder identity number is required" }),
        email: z
          .string()
          .email({ message: "Valid ticket holder email is required" }),
        whatsapp: z
          .string()
          .min(1, { message: "Ticket holder WhatsApp number is required" }),
      }),
    )
    .min(1, { message: "At least one ticket holder is required" }),
});
/**
 * POST /api/public/reservations/[reservationId]/purchase
 * Purchase tickets from an existing reservation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> },
) {
  try {
    // Check authentication (optional for guest purchases)
    const session = await auth();

    // Await params
    const { reservationId } = await params;

    const body = await request.json();

    // Log the request body for debugging
    console.log("Purchase API received body:", JSON.stringify(body, null, 2));

    let validatedData;
    try {
      // Validate request data
      validatedData = purchaseFromReservationSchema.parse(body);
      console.log("Purchase API validation successful:", validatedData);
    } catch (validationError: any) {
      console.error("Purchase API validation error:", validationError);
      console.error(
        "Validation error details:",
        validationError.errors || validationError.message,
      );

      // More detailed error logging
      if (validationError.errors) {
        console.error(
          "Zod validation errors:",
          JSON.stringify(validationError.errors, null, 2),
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validationError.errors || validationError.message,
          validationErrors: validationError.errors,
        },
        { status: 400 },
      );
    }

    // Purchase tickets from reservation (userId is optional for guest purchases)
    const result = await handlePurchaseFromReservation({
      userId: session?.user?.id || null,
      reservationId,
      sessionId: validatedData.sessionId,
      buyerInfo: validatedData.buyerInfo,
      ticketHolders: validatedData.ticketHolders,
    });

    return NextResponse.json({
      success: true,
      data: {
        transaction: {
          id: result.transaction.id,
          invoiceNumber: result.transaction.invoiceNumber,
          amount: Number(result.transaction.amount),
          status: result.transaction.status,
        },
        ticketCount: result.tickets.length,
        reservation: {
          id: result.reservation.id,
          status: result.reservation.status,
        },
      },
      message:
        "Tickets purchased successfully from reservation. Proceed to checkout to complete payment.",
    });

  } catch (error: any) {
    console.error(
      `Error purchasing from reservation ${(await params).reservationId}:`,
      error,
    );

    // Handle Prisma-specific errors
    if (error.code === 'P2028') {
      console.error("Prisma transaction error - connection or timeout issue");
      return NextResponse.json(
        {
          success: false,
          error: "Database transaction failed. Please try again.",
          code: "TRANSACTION_FAILED"
        },
        { status: 500 },
      );
    }

    if (error.code === 'P2034') {
      console.error("Prisma write conflict error");
      return NextResponse.json(
        {
          success: false,
          error: "Transaction conflict. Please try again.",
          code: "CONFLICT"
        },
        { status: 409 },
      );
    }

    // Handle business logic errors
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
          error: "You don't have permission to purchase from this reservation",
        },
        { status: 403 },
      );
    }

    if (error.message.includes("expired")) {
      return NextResponse.json(
        { success: false, error: "Reservation has expired" },
        { status: 409 },
      );
    }

    if (error.message.includes("not available") || error.message.includes("not active")) {
      return NextResponse.json(
        { success: false, error: "Reservation is not available for purchase" },
        { status: 409 },
      );
    }

    if (error.message.includes("Expected")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    // Handle database connection errors
    if (error.message.includes("connection") || error.message.includes("timeout")) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection issue. Please try again.",
          code: "CONNECTION_ERROR"
        },
        { status: 503 },
      );
    }

    // Generic error fallback
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to purchase tickets from reservation",
        code: "INTERNAL_ERROR"
      },
      { status: 500 },
    );
  }
}