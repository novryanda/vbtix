import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { prisma } from "~/server/db";
import { generateTicketPDF, generateTransactionTicketPDFs, type TicketPDFData, formatIndonesianDate, formatIndonesianTime } from "~/lib/services/react-pdf-ticket.service";
import { generateQRCodeData } from "~/lib/services/qr-code.service";
import { z } from "zod";

// Validation schema for route parameters
const paramsSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

// Validation schema for query parameters
const querySchema = z.object({
  sessionId: z.string().optional(),
});

/**
 * GET /api/public/orders/[orderId]/download-tickets
 * Download PDF tickets for a completed order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Validate parameters
    const resolvedParams = await params;
    const validatedParams = paramsSchema.safeParse(resolvedParams);
    if (!validatedParams.success) {
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

    // Validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      sessionId: searchParams.get("sessionId") || undefined,
    };
    const validatedQuery = querySchema.safeParse(queryParams);
    if (!validatedQuery.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: validatedQuery.error.format(),
        },
        { status: 400 }
      );
    }

    const { sessionId } = validatedQuery.data;

    // Get user session (optional for guest purchases)
    const session = await auth();
    const userId = session?.user?.id;

    console.log(`📥 Download tickets request for order: ${orderId}, userId: ${userId}, sessionId: ${sessionId}`);

    // Build where clause for order lookup (same logic as other endpoints)
    let whereClause: any = {
      id: orderId,
    };

    if (userId) {
      // For authenticated users
      whereClause.userId = userId;
    } else if (sessionId) {
      // For guest users, find orders created by guest users with matching session ID
      whereClause.user = {
        phone: `guest_${sessionId}`, // Guest users have phone set to guest_sessionId
      };
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication or session ID required",
          message: "Please provide a session ID or log in to download tickets",
        },
        { status: 401 }
      );
    }

    // Get order with all related data using the proper where clause
    const order = await prisma.transaction.findFirst({
      where: whereClause,
      include: {
        user: true,
        event: {
          include: {
            organizer: true,
          },
        },
        tickets: {
          include: {
            ticketType: true,
            ticketHolder: true,
          },
        },
        buyerInfo: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found or access denied",
          message: "The order was not found or you don't have permission to access it",
        },
        { status: 404 }
      );
    }

    console.log(`✅ Order found for download: ${order.invoiceNumber}, user: ${order.user.phone || order.user.email}, status: ${order.status}`);

    // Check if order is completed and tickets are available
    if (order.status !== "SUCCESS") {
      console.log(`❌ Order ${order.invoiceNumber} status is ${order.status}, not SUCCESS`);
      return NextResponse.json(
        {
          success: false,
          error: "Tickets are not available yet",
          message: `Tickets can only be downloaded after payment is confirmed. Current status: ${order.status}`,
          currentStatus: order.status,
        },
        { status: 400 }
      );
    }

    // Check if tickets have QR codes generated
    const ticketsWithQR = order.tickets.filter(ticket => ticket.qrCodeImageUrl);
    console.log(`🎫 Order ${order.invoiceNumber} has ${order.tickets.length} tickets, ${ticketsWithQR.length} with QR codes`);

    if (ticketsWithQR.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "QR codes not generated yet",
          message: "Please wait a moment while we prepare your tickets",
          debug: {
            totalTickets: order.tickets.length,
            ticketsWithQR: ticketsWithQR.length,
          },
        },
        { status: 400 }
      );
    }

    console.log(`🎫 Generating PDF tickets for order ${order.invoiceNumber} - ${ticketsWithQR.length} tickets`);

    // Prepare customer information
    const customerName = order.buyerInfo?.fullName || order.user.name || "Customer";

    // Format event date and time using service utilities
    const eventDate = new Date(order.event.startDate);
    const formattedEventDate = formatIndonesianDate(eventDate);
    const formattedEventTime = formatIndonesianTime(eventDate);

    // Prepare all ticket data for PDF generation
    const allTicketData: TicketPDFData[] = [];
    
    for (const ticket of ticketsWithQR) {
      // Generate QR code data for the ticket
      const qrData = generateQRCodeData({
        ticketId: ticket.id,
        eventId: order.event.id,
        userId: order.userId,
        transactionId: order.id,
        ticketTypeId: ticket.ticketTypeId,
        eventDate: order.event.startDate,
      });

      // Prepare ticket data for PDF generation
      const ticketPDFData: TicketPDFData = {
        ticketId: ticket.id,
        ticketNumber: ticket.id,
        ticketType: ticket.ticketType.name,
        holderName: ticket.ticketHolder?.fullName || customerName,
        qrData,
        logoUrl: ticket.logoUrl || undefined,
        ticketTypeLogoUrl: ticket.ticketType.logoUrl || undefined,
        eventImageUrl: order.event.posterUrl || undefined,
        event: {
          title: order.event.title,
          date: formattedEventDate,
          time: formattedEventTime,
          location: order.event.venue || "TBA",
          address: `${order.event.address || ""}, ${order.event.city || ""}, ${order.event.province || ""}`.trim(),
        },
        order: {
          invoiceNumber: order.invoiceNumber,
          totalAmount: Number(order.amount),
          paymentDate: order.updatedAt.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      };

      allTicketData.push(ticketPDFData);
    }

    // Use the transaction PDF generation service for better performance
    const pdfBuffers = await generateTransactionTicketPDFs(allTicketData);

    console.log(`✅ Generated ${pdfBuffers.length} PDF tickets for order ${order.invoiceNumber}`);

    // Ensure we have generated PDFs
    if (pdfBuffers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No tickets generated",
          message: "Failed to generate PDF tickets. Please try again.",
        },
        { status: 500 }
      );
    }

    // If only one ticket, return single PDF
    if (pdfBuffers.length === 1) {
      const filename = `tiket-${order.invoiceNumber}-${order.event.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
      const firstPDF = pdfBuffers[0]!;
      
      return new NextResponse(firstPDF, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': firstPDF.length.toString(),
        },
      });
    }

    // For multiple tickets, we would need to implement ZIP creation
    // For now, return the first ticket with a note
    const filename = `tiket-${order.invoiceNumber}-${order.event.title.replace(/[^a-zA-Z0-9]/g, '-')}-1.pdf`;
    const firstPDF = pdfBuffers[0]!;
    
    return new NextResponse(firstPDF, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': firstPDF.length.toString(),
        'X-Total-Tickets': pdfBuffers.length.toString(),
        'X-Ticket-Index': '1',
      },
    });

  } catch (error) {
    console.error("Error downloading tickets:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to download tickets",
        message: "An error occurred while generating your tickets. Please try again later.",
      },
      { status: 500 }
    );
  }
}
