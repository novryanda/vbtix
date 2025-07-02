import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { emailService } from "~/lib/email-service";
import { env } from "~/env";

/**
 * Debug endpoint to test email service configuration and delivery
 * GET /api/debug/email-service - Check configuration
 * POST /api/debug/email-service - Test email delivery
 */

export async function GET() {
  try {
    // Check authentication (admin only for security)
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Check email service configuration
    const config = {
      resendApiKey: env.RESEND_API_KEY ? "✅ Set" : "❌ Missing",
      emailFrom: env.EMAIL_FROM || "❌ Missing",
      qrEncryptionKey: env.QR_CODE_ENCRYPTION_KEY ? "✅ Set" : "❌ Missing",
    };

    // Test Resend API connection
    let resendStatus = "❌ Not tested";
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(env.RESEND_API_KEY);
      
      // Try to get domains (this tests API key validity)
      const domains = await resend.domains.list();
      resendStatus = domains.error ? `❌ Error: ${domains.error.message}` : "✅ Connected";
    } catch (error: any) {
      resendStatus = `❌ Error: ${error.message}`;
    }

    return NextResponse.json({
      success: true,
      data: {
        configuration: config,
        resendConnection: resendStatus,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error checking email service:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication (admin only for security)
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { testEmail, testType = "simple" } = body;

    if (!testEmail) {
      return NextResponse.json(
        { success: false, error: "testEmail is required" },
        { status: 400 }
      );
    }

    console.log(`🧪 Testing email delivery to: ${testEmail}`);
    console.log(`🧪 Test type: ${testType}`);

    let result;

    if (testType === "simple") {
      // Test simple email delivery
      result = await emailService.sendAccountVerification({
        to: testEmail,
        userName: "Test User",
        verificationUrl: "https://example.com/verify/test",
      });
    } else if (testType === "ticket") {
      // Test ticket delivery email
      result = await emailService.sendTicketDelivery({
        to: testEmail,
        customerName: "Test Customer",
        event: {
          title: "Test Event",
          date: "Sabtu, 20 Januari 2025",
          time: "19:00 WIB",
          location: "Test Venue",
          address: "Test Address, Test City, Test Province",
        },
        order: {
          invoiceNumber: "TEST-INV-123",
          totalAmount: 100000,
          paymentDate: "20 Januari 2025, 10:00 WIB",
        },
        tickets: [
          {
            id: "test-ticket-1",
            ticketNumber: "TEST-001",
            ticketType: "Regular",
            holderName: "Test Customer",
            qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
          },
        ],
      });
    } else if (testType === "pdf") {
      // Test PDF ticket delivery
      result = await emailService.sendTicketDeliveryWithPDF({
        to: testEmail,
        customerName: "Test Customer",
        event: {
          title: "Test Event",
          date: "Sabtu, 20 Januari 2025",
          time: "19:00 WIB",
          location: "Test Venue",
          address: "Test Address, Test City, Test Province",
        },
        order: {
          invoiceNumber: "TEST-INV-123",
          totalAmount: 100000,
          paymentDate: "20 Januari 2025, 10:00 WIB",
        },
        tickets: [
          {
            id: "test-ticket-1",
            ticketNumber: "TEST-001",
            ticketType: "Regular",
            holderName: "Test Customer",
            eventId: "test-event-id",
            userId: "test-user-id",
            transactionId: "test-transaction-id",
            ticketTypeId: "test-ticket-type-id",
            eventDate: new Date("2025-01-20"),
          },
        ],
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid test type. Use: simple, ticket, or pdf" },
        { status: 400 }
      );
    }

    console.log(`🧪 Email test result:`, result);

    return NextResponse.json({
      success: true,
      data: {
        testEmail,
        testType,
        result,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error testing email delivery:", error);
    return NextResponse.json(
      { success: false, error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
