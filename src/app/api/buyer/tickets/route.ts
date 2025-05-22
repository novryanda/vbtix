import { NextRequest, NextResponse } from "next/server";
import {
  handleGetUserTickets,
  handlePurchaseTickets,
} from "~/server/api/buyer-tickets";
import { auth } from "~/server/auth";
import { TicketStatus } from "@prisma/client";
import { z } from "zod";

// Validation schema for query parameters
const ticketsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.nativeEnum(TicketStatus).optional(),
});

// Validation schema for purchase request
const purchaseTicketsSchema = z.object({
  items: z.array(
    z.object({
      ticketTypeId: z.string(),
      quantity: z.number().int().positive(),
    }),
  ),
});

/**
 * GET /api/buyer/tickets
 * Get tickets for the authenticated user
 * This endpoint requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required to view tickets",
          message: "Please log in to view your tickets",
        },
        { status: 401 },
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;

    // Parse and validate query parameters
    const parsedParams = ticketsQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
    });

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          details: parsedParams.error.format(),
        },
        { status: 400 },
      );
    }

    const { page, limit, status } = parsedParams.data;

    // Get tickets for the user
    const result = await handleGetUserTickets({
      userId: session.user.id,
      page,
      limit,
      status,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: result.tickets,
      meta: result.meta,
    });
  } catch (error: any) {
    console.error("Error getting user tickets:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get tickets" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/buyer/tickets
 * Purchase tickets
 * This endpoint requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required to purchase tickets",
          message: "Please log in to purchase tickets",
        },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request body
    const validatedData = purchaseTicketsSchema.safeParse(body);

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

    // Purchase tickets
    const result = await handlePurchaseTickets({
      userId: session.user.id,
      items: validatedData.data.items,
    });

    // Return response
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
      },
      message:
        "Tickets purchased successfully. Proceed to checkout to complete your payment.",
    });
  } catch (error: any) {
    console.error("Error purchasing tickets:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to purchase tickets",
      },
      {
        status:
          error.message.includes("Not enough tickets") ||
          error.message.includes("Maximum")
            ? 400
            : 500,
      },
    );
  }
}
