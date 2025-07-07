import { NextRequest, NextResponse } from "next/server";
import { emailService } from "~/lib/email-service";
import { env } from "~/env";

/**
 * GET /api/test/email-debug
 * Debug email configuration and test sending
 */
export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const config = {
      hasResendApiKey: !!env.RESEND_API_KEY,
      emailFrom: env.EMAIL_FROM,
      resendApiKeyPrefix: env.RESEND_API_KEY ? env.RESEND_API_KEY.substring(0, 10) + "..." : "Not set",
    };

    console.log("📧 Email Debug Configuration:", config);

    return NextResponse.json({
      success: true,
      message: "Email configuration debug",
      config,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Email debug error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/test/email-debug
 * Test sending an email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, testType = "simple" } = body;

    if (!to) {
      return NextResponse.json(
        {
          success: false,
          error: "Email address (to) is required",
        },
        { status: 400 }
      );
    }

    console.log(`📧 Testing email send to: ${to}, type: ${testType}`);

    let result;

    if (testType === "ticket") {
      // Test ticket delivery email
      result = await emailService.sendTicketDelivery({
        to,
        customerName: "Test Customer",
        event: {
          title: "Test Event",
          date: "2025-01-15",
          time: "19:00",
          location: "Test Venue",
          address: "Test Address, Test City, Test Province",
        },
        order: {
          invoiceNumber: "TEST-001",
          totalAmount: 100000,
          paymentDate: "2025-01-10",
        },
        tickets: [
          {
            id: "test-ticket-1",
            ticketNumber: "TKT-001",
            ticketType: "Regular",
            holderName: "Test Customer",
            qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
          },
        ],
      });
    } else {
      // Test simple email
      result = await emailService.sendEmail({
        to,
        subject: "VBTicket Email Test",
        html: `
          <h1>Email Test Successful!</h1>
          <p>This is a test email from VBTicket to verify email configuration.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
          <p>From: ${env.EMAIL_FROM}</p>
        `,
        text: `Email Test Successful! This is a test email from VBTicket. Timestamp: ${new Date().toISOString()}`,
        tags: [{ name: "category", value: "test" }],
      });
    }

    console.log("📧 Email test result:", result);

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully (${testType})`,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Email test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
