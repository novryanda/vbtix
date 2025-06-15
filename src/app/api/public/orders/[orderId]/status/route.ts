import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { auth } from "~/server/auth";
import { z } from "zod";

// Validation schema for route parameters
const paramsSchema = z.object({
  orderId: z.string().min(1),
});

/**
 * GET /api/public/orders/[orderId]/status
 * Get real-time order status for buyers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Await params for Next.js 15 compatibility
    const resolvedParams = await params;

    // Validate route parameters
    const validatedParams = paramsSchema.safeParse(resolvedParams);

    if (!validatedParams.success) {
      console.error("Invalid order ID params:", resolvedParams, validatedParams.error);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order ID",
          details: validatedParams.error.format(),
        },
        { status: 400 }
      );
    }

    const { orderId } = validatedParams.data;
    console.log("Fetching status for order:", orderId);

    // Check authentication (optional for guest purchases)
    const session = await auth();

    // Get query parameters for guest access
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");

    // For guest users, we need either a session ID or authentication
    if (!session?.user && !sessionId) {
      console.log("No authentication or session ID provided for order:", orderId);
      return NextResponse.json(
        {
          success: false,
          error: "Authentication or session ID required",
        },
        { status: 401 }
      );
    }

    // Build where clause for order lookup (same logic as handleGetOrderById)
    let whereClause: any = {
      id: orderId,
    };

    if (session?.user?.id) {
      // For authenticated users
      whereClause.userId = session.user.id;
    } else if (sessionId) {
      // For guest users, find orders created by guest users with matching session ID
      whereClause.user = {
        phone: `guest_${sessionId}`, // Guest users have phone set to guest_sessionId
      };
    }

    // Get order with minimal required data for status check
    const order = await prisma.transaction.findFirst({
      where: whereClause,
      select: {
        id: true,
        status: true,
        paymentMethod: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            phone: true,
          },
        },
        tickets: {
          select: {
            id: true,
            qrCodeImageUrl: true,
            qrCodeStatus: true,
          },
        },
        payments: {
          select: {
            status: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    // Check if QR codes are available
    const hasQRCodes = order.tickets.some(
      (ticket) => ticket.qrCodeImageUrl && ticket.qrCodeStatus === "ACTIVE"
    );

    // Get latest payment status
    const latestPaymentStatus = order.payments[0]?.status || null;

    // Determine overall status
    let overallStatus: string = order.status;

    // For manual payments, check if awaiting verification
    if (
      order.status === "PENDING" &&
      order.paymentMethod === "MANUAL_PAYMENT" &&
      !latestPaymentStatus
    ) {
      overallStatus = "AWAITING_VERIFICATION";
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        status: overallStatus,
        paymentStatus: latestPaymentStatus,
        paymentMethod: order.paymentMethod,
        hasQRCodes,
        lastUpdated: order.updatedAt.toISOString(),
        createdAt: order.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching order status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
