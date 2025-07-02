import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { emailService } from "~/lib/email-service";
import { env } from "~/env";

/**
 * Comprehensive email debugging endpoint
 * POST /api/debug/email-test - Test email delivery with detailed diagnostics
 */

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
    const { testEmail = "novryandareza0@gmail.com", testType = "simple" } = body;

    console.log(`🧪 Starting comprehensive email test`);
    console.log(`📧 Test email: ${testEmail}`);
    console.log(`🔧 Test type: ${testType}`);

    // Step 1: Check environment configuration
    console.log("\n📋 Step 1: Environment Configuration Check");
    const envCheck = {
      RESEND_API_KEY: env.RESEND_API_KEY ? `✅ Set (${env.RESEND_API_KEY.substring(0, 10)}...)` : "❌ Missing",
      EMAIL_FROM: env.EMAIL_FROM ? `✅ Set (${env.EMAIL_FROM})` : "❌ Missing",
      QR_CODE_ENCRYPTION_KEY: env.QR_CODE_ENCRYPTION_KEY ? "✅ Set" : "❌ Missing",
    };
    console.log("Environment variables:", envCheck);

    // Step 2: Test Resend API connection
    console.log("\n🔌 Step 2: Resend API Connection Test");
    let resendConnectionResult = null;
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(env.RESEND_API_KEY);
      
      // Test API key validity by listing domains
      const domainsResponse = await resend.domains.list();
      console.log("Resend domains response:", domainsResponse);
      
      if (domainsResponse.error) {
        resendConnectionResult = {
          success: false,
          error: domainsResponse.error.message,
          details: domainsResponse.error
        };
      } else {
        resendConnectionResult = {
          success: true,
          domains: domainsResponse.data?.data || [],
          message: "API key is valid"
        };
      }
    } catch (error: any) {
      resendConnectionResult = {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
    console.log("Resend connection result:", resendConnectionResult);

    // Step 3: Test simple email delivery
    console.log("\n📤 Step 3: Simple Email Delivery Test");
    let simpleEmailResult = null;
    try {
      simpleEmailResult = await emailService.sendEmail({
        to: testEmail,
        subject: "🧪 VBTicket Email Service Test",
        html: `
          <h2>Email Service Test</h2>
          <p>This is a test email from VBTicket to verify email delivery is working.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Timestamp: ${new Date().toISOString()}</li>
            <li>Test Type: Simple Email</li>
            <li>Recipient: ${testEmail}</li>
          </ul>
          <p>If you receive this email, the basic email service is working correctly.</p>
        `,
        text: `VBTicket Email Service Test - ${new Date().toISOString()}`,
        tags: [{ name: "category", value: "test" }],
      });
      console.log("Simple email result:", simpleEmailResult);
    } catch (error: any) {
      simpleEmailResult = {
        success: false,
        error: error.message,
        stack: error.stack
      };
      console.error("Simple email error:", error);
    }

    // Step 4: Test ticket delivery email (if requested)
    let ticketEmailResult = null;
    if (testType === "ticket" || testType === "all") {
      console.log("\n🎫 Step 4: Ticket Delivery Email Test");
      try {
        ticketEmailResult = await emailService.sendTicketDelivery({
          to: testEmail,
          customerName: "Test Customer",
          event: {
            title: "Test Event - Email Debug",
            date: "Sabtu, 20 Januari 2025",
            time: "19:00 WIB",
            location: "Test Venue",
            address: "Test Address, Test City, Test Province",
          },
          order: {
            invoiceNumber: "TEST-DEBUG-001",
            totalAmount: 100000,
            paymentDate: "20 Januari 2025, 10:00 WIB",
          },
          tickets: [
            {
              id: "test-ticket-debug-1",
              ticketNumber: "DEBUG-001",
              ticketType: "Regular",
              holderName: "Test Customer",
              qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            },
          ],
        });
        console.log("Ticket email result:", ticketEmailResult);
      } catch (error: any) {
        ticketEmailResult = {
          success: false,
          error: error.message,
          stack: error.stack
        };
        console.error("Ticket email error:", error);
      }
    }

    // Step 5: Test PDF ticket delivery (if requested)
    let pdfEmailResult = null;
    if (testType === "pdf" || testType === "all") {
      console.log("\n📄 Step 5: PDF Ticket Delivery Email Test");
      try {
        pdfEmailResult = await emailService.sendTicketDeliveryWithPDF({
          to: testEmail,
          customerName: "Test Customer",
          event: {
            title: "Test Event - PDF Debug",
            date: "Sabtu, 20 Januari 2025",
            time: "19:00 WIB",
            location: "Test Venue",
            address: "Test Address, Test City, Test Province",
          },
          order: {
            invoiceNumber: "TEST-PDF-DEBUG-001",
            totalAmount: 100000,
            paymentDate: "20 Januari 2025, 10:00 WIB",
          },
          tickets: [
            {
              id: "test-ticket-pdf-debug-1",
              ticketNumber: "PDF-DEBUG-001",
              ticketType: "Regular",
              holderName: "Test Customer",
              eventId: "test-event-debug",
              userId: "test-user-debug",
              transactionId: "test-transaction-debug",
              ticketTypeId: "test-ticket-type-debug",
              eventDate: new Date("2025-01-20"),
            },
          ],
        });
        console.log("PDF email result:", pdfEmailResult);
      } catch (error: any) {
        pdfEmailResult = {
          success: false,
          error: error.message,
          stack: error.stack
        };
        console.error("PDF email error:", error);
      }
    }

    // Compile comprehensive results
    const results = {
      timestamp: new Date().toISOString(),
      testEmail,
      testType,
      steps: {
        environmentCheck: envCheck,
        resendConnection: resendConnectionResult,
        simpleEmail: simpleEmailResult,
        ticketEmail: ticketEmailResult,
        pdfEmail: pdfEmailResult,
      },
      summary: {
        environmentConfigured: !!(env.RESEND_API_KEY && env.EMAIL_FROM),
        resendConnected: resendConnectionResult?.success || false,
        simpleEmailSent: simpleEmailResult?.success || false,
        ticketEmailSent: ticketEmailResult?.success || false,
        pdfEmailSent: pdfEmailResult?.success || false,
      },
      recommendations: []
    };

    // Generate recommendations based on results
    if (!results.summary.environmentConfigured) {
      results.recommendations.push("❌ Configure RESEND_API_KEY and EMAIL_FROM environment variables");
    }
    if (!results.summary.resendConnected) {
      results.recommendations.push("❌ Fix Resend API connection - check API key validity");
    }
    if (results.summary.resendConnected && !results.summary.simpleEmailSent) {
      results.recommendations.push("❌ Simple email failed - check email service implementation");
    }
    if (results.summary.simpleEmailSent && !results.summary.ticketEmailSent) {
      results.recommendations.push("❌ Ticket email failed - check ticket email template");
    }
    if (results.summary.ticketEmailSent && !results.summary.pdfEmailSent) {
      results.recommendations.push("❌ PDF email failed - check PDF generation service");
    }
    if (results.summary.environmentConfigured && results.summary.resendConnected && results.summary.simpleEmailSent) {
      results.recommendations.push("✅ Basic email service is working correctly");
    }

    console.log("\n🎯 Final Results:", results);

    return NextResponse.json({
      success: true,
      data: results,
    });

  } catch (error: any) {
    console.error("Error in email debug test:", error);
    return NextResponse.json(
      { success: false, error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
