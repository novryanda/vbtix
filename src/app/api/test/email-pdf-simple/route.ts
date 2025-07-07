import { NextRequest, NextResponse } from "next/server";
import { emailService } from "~/lib/email-service";

/**
 * POST /api/test/email-pdf-simple
 * Simple test for PDF email delivery
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email = "novryandareza0@gmail.com",
      customerName = "Test Customer",
      eventTitle = "Simple PDF Email Test"
    } = body;

    console.log(`🧪 Testing simple PDF email delivery to: ${email}`);

    const result = await emailService.sendTicketDeliveryWithPDF({
      to: email,
      customerName,
      event: {
        title: eventTitle,
        date: "Sabtu, 15 Juni 2025",
        time: "19:00 WIB",
        location: "Jakarta Convention Center",
        address: "Jl. Gatot Subroto, Jakarta Pusat, DKI Jakarta",
      },
      order: {
        invoiceNumber: "INV-SIMPLE-TEST-001",
        totalAmount: 150000,
        paymentDate: "15 Juni 2025, 14:30 WIB",
      },
      tickets: [{
        id: "simple-test-ticket-001",
        ticketNumber: "SIMPLE-001",
        ticketType: "VIP",
        holderName: customerName,
        qrCode: undefined,
        eventId: "simple-test-event-001",
        userId: "simple-test-user-001",
        transactionId: "simple-test-transaction-001",
        ticketTypeId: "simple-test-ticket-type-001",
        eventDate: new Date(),
      }],
    });

    return NextResponse.json({
      success: result.success,
      message: result.success ? "PDF email sent successfully" : "PDF email failed",
      data: {
        messageId: result.messageId,
        error: result.error,
        emailResult: result.fullResult,
      },
    });

  } catch (error) {
    console.error("❌ Simple PDF email test failed:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

/**
 * GET /api/test/email-pdf-simple
 * Get test information
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Simple PDF Email Test Endpoint",
    usage: {
      method: "POST",
      body: {
        email: "recipient@example.com (required)",
        customerName: "Customer Name (optional)",
        eventTitle: "Event Title (optional)",
      },
    },
    example: {
      description: "Send test PDF email",
      body: {
        email: "test@example.com",
        customerName: "John Doe",
        eventTitle: "My Test Event"
      },
    },
  });
}
