import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { emailService } from "~/lib/email-service";
import { generateTransactionQRCodes } from "~/server/services/ticket-qr.service";
import { env } from "~/env";

/**
 * POST /api/debug/realtime-email
 * Debug endpoint to test real-time updates and email delivery
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, action = "test-all" } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    console.log(`🔍 Debugging order: ${orderId}, action: ${action}`);

    const debugResults: any = {
      orderId,
      action,
      timestamp: new Date().toISOString(),
      tests: {},
    };

    // Test 1: Check if order exists
    console.log("🔍 Test 1: Checking if order exists...");
    const order = await prisma.transaction.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        event: true,
        tickets: {
          include: {
            ticketType: true,
            ticketHolder: true,
          },
        },
        buyerInfo: true,
        payments: true,
      },
    });

    if (!order) {
      debugResults.tests.orderExists = {
        success: false,
        error: "Order not found",
      };
      return NextResponse.json({
        success: false,
        error: "Order not found",
        debug: debugResults,
      });
    }

    debugResults.tests.orderExists = {
      success: true,
      data: {
        id: order.id,
        status: order.status,
        paymentMethod: order.paymentMethod,
        ticketCount: order.tickets.length,
        hasUser: !!order.user,
        hasBuyerInfo: !!order.buyerInfo,
        hasPayments: order.payments.length > 0,
      },
    };

    // Test 2: Check environment variables
    console.log("🔍 Test 2: Checking environment variables...");
    debugResults.tests.environmentVariables = {
      success: true,
      data: {
        RESEND_API_KEY: !!env.RESEND_API_KEY ? "✅ Set" : "❌ Missing",
        EMAIL_FROM: !!env.EMAIL_FROM ? "✅ Set" : "❌ Missing",
        QR_CODE_ENCRYPTION_KEY: !!env.QR_CODE_ENCRYPTION_KEY ? "✅ Set" : "❌ Missing",
        NODE_ENV: env.NODE_ENV,
      },
    };

    // Test 3: Check QR codes
    console.log("🔍 Test 3: Checking QR codes...");
    const ticketsWithQR = order.tickets.filter(t => t.qrCodeImageUrl);
    const ticketsWithoutQR = order.tickets.filter(t => !t.qrCodeImageUrl);

    debugResults.tests.qrCodes = {
      success: ticketsWithQR.length > 0,
      data: {
        totalTickets: order.tickets.length,
        ticketsWithQR: ticketsWithQR.length,
        ticketsWithoutQR: ticketsWithoutQR.length,
        qrCodeStatus: order.tickets.map(t => ({
          ticketId: t.id,
          hasQRCode: !!t.qrCodeImageUrl,
          qrCodeStatus: t.qrCodeStatus,
        })),
      },
    };

    // Test 4: Generate QR codes if missing
    if (action === "test-all" || action === "generate-qr") {
      console.log("🔍 Test 4: Generating QR codes...");
      try {
        const qrResult = await generateTransactionQRCodes(orderId);
        debugResults.tests.qrGeneration = {
          success: qrResult.success,
          data: {
            generatedCount: qrResult.generatedCount,
            errors: qrResult.errors,
          },
        };
      } catch (error: any) {
        debugResults.tests.qrGeneration = {
          success: false,
          error: error.message,
        };
      }
    }

    // Test 5: Test email configuration
    if (action === "test-all" || action === "test-email") {
      console.log("🔍 Test 5: Testing email configuration...");
      try {
        // Get email address
        const emailTo = order.buyerInfo?.email || order.user.email;
        
        if (!emailTo) {
          debugResults.tests.emailConfig = {
            success: false,
            error: "No email address found for order",
          };
        } else {
          // Test email sending (dry run)
          const testEmailData = {
            to: emailTo,
            customerName: order.buyerInfo?.fullName || order.user.name || "Test Customer",
            event: {
              title: order.event.title,
              date: new Date(order.event.startDate).toLocaleDateString("id-ID"),
              time: order.event.startTime || "TBA",
              location: order.event.venue,
              address: `${order.event.address}, ${order.event.city}`,
              image: order.event.posterUrl || undefined,
            },
            order: {
              invoiceNumber: order.invoiceNumber,
              totalAmount: Number(order.amount),
              paymentDate: new Date().toLocaleDateString("id-ID"),
            },
            tickets: order.tickets.map((ticket) => ({
              id: ticket.id,
              ticketNumber: ticket.id,
              ticketType: ticket.ticketType.name,
              holderName: ticket.ticketHolder?.fullName || order.buyerInfo?.fullName || order.user.name || "Customer",
              qrCode: ticket.qrCodeImageUrl || undefined,
            })),
          };

          debugResults.tests.emailConfig = {
            success: true,
            data: {
              emailTo,
              hasQRCodes: testEmailData.tickets.some(t => t.qrCode),
              ticketCount: testEmailData.tickets.length,
              emailData: testEmailData,
            },
          };

          // Actually send email if requested
          if (action === "send-email") {
            console.log("📧 Sending test email...");
            const emailResult = await emailService.sendTicketDelivery(testEmailData);
            debugResults.tests.emailSending = emailResult;
          }
        }
      } catch (error: any) {
        debugResults.tests.emailConfig = {
          success: false,
          error: error.message,
        };
      }
    }

    // Test 6: Test real-time status endpoint
    if (action === "test-all" || action === "test-status") {
      console.log("🔍 Test 6: Testing status endpoint...");
      try {
        // Simulate the status endpoint call
        const statusData = {
          orderId: order.id,
          status: order.status,
          paymentMethod: order.paymentMethod,
          hasQRCodes: order.tickets.some(t => t.qrCodeImageUrl && t.qrCodeStatus === "ACTIVE"),
          lastUpdated: order.updatedAt.toISOString(),
          createdAt: order.createdAt.toISOString(),
          userPhone: order.user.phone, // Include user phone to verify guest user logic
          isGuestUser: order.user.phone?.startsWith("guest_"),
        };

        debugResults.tests.statusEndpoint = {
          success: true,
          data: statusData,
        };
      } catch (error: any) {
        debugResults.tests.statusEndpoint = {
          success: false,
          error: error.message,
        };
      }
    }

    // Summary
    const successfulTests = Object.values(debugResults.tests).filter((test: any) => test.success).length;
    const totalTests = Object.keys(debugResults.tests).length;

    debugResults.summary = {
      successfulTests,
      totalTests,
      allPassed: successfulTests === totalTests,
      recommendations: [],
    };

    // Add recommendations based on test results
    if (!debugResults.tests.qrCodes?.success) {
      debugResults.summary.recommendations.push("Generate QR codes for tickets");
    }
    if (!debugResults.tests.emailConfig?.success) {
      debugResults.summary.recommendations.push("Fix email configuration");
    }
    if (!env.RESEND_API_KEY) {
      debugResults.summary.recommendations.push("Set RESEND_API_KEY environment variable");
    }
    if (!env.EMAIL_FROM) {
      debugResults.summary.recommendations.push("Set EMAIL_FROM environment variable");
    }

    console.log(`✅ Debug completed: ${successfulTests}/${totalTests} tests passed`);

    return NextResponse.json({
      success: true,
      message: `Debug completed: ${successfulTests}/${totalTests} tests passed`,
      debug: debugResults,
    });
  } catch (error: any) {
    console.error("❌ Debug failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        debug: {
          error: error.message,
          stack: error.stack,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/debug/realtime-email
 * Get debug instructions
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Real-time Email Debug Endpoint",
    instructions: {
      description: "Debug real-time updates and email delivery issues",
      usage: {
        method: "POST",
        body: {
          orderId: "string (required) - The order ID to debug",
          action: "string (optional) - test-all | generate-qr | test-email | send-email | test-status",
        },
      },
      actions: {
        "test-all": "Run all tests (default)",
        "generate-qr": "Generate QR codes for the order",
        "test-email": "Test email configuration without sending",
        "send-email": "Actually send test email",
        "test-status": "Test status endpoint simulation",
      },
      example: {
        curl: `curl -X POST http://localhost:3000/api/debug/realtime-email \\
  -H "Content-Type: application/json" \\
  -d '{"orderId": "cmbxgyo6m0004uoz0ocvtehpm", "action": "test-all"}'`,
      },
    },
  });
}
