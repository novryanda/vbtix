import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { z } from "zod";

// Validation schema for order lookup request
const orderLookupSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  email: z.string().email("Valid email is required"),
});

/**
 * POST /api/public/orders/lookup
 * Lookup order by order ID and email (public endpoint for guest access)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    console.log("Order lookup API received:", body);

    // Validate request body
    const validatedData = orderLookupSchema.safeParse(body);

    if (!validatedData.success) {
      console.error("Order lookup validation error:", validatedData.error.format());
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validatedData.error.format(),
        },
        { status: 400 },
      );
    }

    const { orderId, email } = validatedData.data;

    // Find order by ID and verify email matches
    const order = await prisma.transaction.findFirst({
      where: {
        id: orderId,
        OR: [
          // For authenticated users
          {
            user: {
              email: email,
            },
          },
          // For guest users, check buyerInfo email
          {
            buyerInfo: {
              email: email,
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            venue: true,
            city: true,
            province: true,
            startDate: true,
            endDate: true,
            posterUrl: true,
            organizer: {
              select: {
                id: true,
                orgName: true,
                verified: true,
              },
            },
          },
        },
        orderItems: {
          include: {
            ticketType: {
              select: {
                id: true,
                name: true,
                price: true,
                logoUrl: true,
              },
            },
          },
        },
        tickets: {
          select: {
            id: true,
            qrCode: true,
            qrCodeImageUrl: true,
            qrCodeStatus: true,
            status: true,
            ticketType: {
              select: {
                id: true,
                name: true,
              },
            },
            ticketHolder: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        buyerInfo: {
          select: {
            fullName: true,
            email: true,
            whatsapp: true,
            identityType: true,
            identityNumber: true,
          },
        },
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
            gateway: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
          message: "No order found with the provided ID and email combination",
        },
        { status: 404 },
      );
    }

    // Check if QR codes are available
    const hasQRCodes = order.tickets.some(
      (ticket) => ticket.qrCodeImageUrl && ticket.qrCodeStatus === "ACTIVE"
    );

    // Get latest payment status
    const latestPayment = order.payments[0];

    // Determine overall status
    let overallStatus: string = order.status;

    // For manual payments and QRIS By Wonders, check if awaiting verification
    if (
      order.status === "PENDING" &&
      (order.paymentMethod === "MANUAL_PAYMENT" || order.paymentMethod === "QRIS_BY_WONDERS") &&
      !latestPayment
    ) {
      overallStatus = "AWAITING_VERIFICATION";
    }

    // Format response data
    const responseData = {
      id: order.id,
      invoiceNumber: order.invoiceNumber,
      status: overallStatus,
      paymentMethod: order.paymentMethod,
      amount: order.amount,
      currency: order.currency,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      hasQRCodes,
      event: order.event,
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        ticketType: item.ticketType,
      })),
      tickets: order.tickets,
      buyerInfo: order.buyerInfo,
      payments: order.payments,
      // Determine if this is a guest order
      isGuestOrder: order.user?.phone?.startsWith("guest_") || false,
      // Extract session ID for guest orders
      sessionId: order.user?.phone?.startsWith("guest_") 
        ? order.user.phone.replace("guest_", "") 
        : null,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "Order found successfully",
    });
  } catch (error: any) {
    console.error("Error looking up order:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to lookup order",
      },
      { status: 500 },
    );
  }
}
