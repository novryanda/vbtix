import { NextRequest, NextResponse } from "next/server";
import { generateTransactionQRCodes } from "~/server/services/ticket-qr.service";
import { emailService } from "~/lib/email-service";
import { prisma } from "~/server/db";

/**
 * POST /api/test/payment-qr-email-flow
 * Test the complete payment verification → QR generation → email delivery flow
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      orderId,
      email = "novryandareza0@gmail.com",
      testType = "complete"
    } = body;

    console.log(`🧪 Testing payment → QR → email flow for order: ${orderId || 'new test order'}`);

    const testResults: any = {
      testType,
      email,
      orderId,
      timestamp: new Date().toISOString(),
      steps: {},
    };

    if (testType === "complete" && orderId) {
      // Test with existing order
      console.log("📋 Step 1: Fetching order details...");
      
      try {
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
          },
        });

        if (!order) {
          throw new Error("Order not found");
        }

        testResults.steps.orderFetch = {
          success: true,
          data: {
            orderId: order.id,
            invoiceNumber: order.invoiceNumber,
            status: order.status,
            ticketCount: order.tickets.length,
            eventTitle: order.event.title,
          },
        };

        console.log("📋 Step 2: Generating QR codes...");
        
        // Generate QR codes for the order
        const qrResult = await generateTransactionQRCodes(orderId);
        
        testResults.steps.qrGeneration = {
          success: qrResult.success,
          data: {
            generatedCount: qrResult.generatedCount,
            errors: qrResult.errors,
          },
        };

        if (qrResult.success && qrResult.generatedCount > 0) {
          console.log("📧 Step 3: Sending ticket delivery email...");
          
          // Get updated order with QR codes
          const updatedOrder = await prisma.transaction.findUnique({
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
            },
          });

          if (updatedOrder) {
            const emailTo = email || updatedOrder.buyerInfo?.email || updatedOrder.user.email;
            const customerName = updatedOrder.buyerInfo?.fullName || updatedOrder.user.name || "Customer";

            // Format event date and time
            const eventDate = new Date(updatedOrder.event.startDate).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            const eventTime = updatedOrder.event.startTime || "Waktu akan diumumkan";
            const paymentDate = new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }) + " WIB";

            // Send email with tickets
            const emailResult = await emailService.sendTicketDelivery({
              to: emailTo,
              customerName,
              event: {
                title: updatedOrder.event.title,
                date: eventDate,
                time: eventTime,
                location: updatedOrder.event.venue,
                address: `${updatedOrder.event.address}, ${updatedOrder.event.city}, ${updatedOrder.event.province}`,
                image: updatedOrder.event.posterUrl || undefined,
              },
              order: {
                invoiceNumber: updatedOrder.invoiceNumber,
                totalAmount: Number(updatedOrder.amount),
                paymentDate,
              },
              tickets: updatedOrder.tickets.map((ticket) => ({
                id: ticket.id,
                ticketNumber: ticket.id,
                ticketType: ticket.ticketType.name,
                holderName: ticket.ticketHolder?.fullName || customerName,
                qrCode: ticket.qrCodeImageUrl || undefined,
              })),
            });

            testResults.steps.emailDelivery = {
              success: emailResult.success,
              data: {
                messageId: emailResult.messageId,
                emailTo,
                ticketsWithQR: updatedOrder.tickets.filter(t => t.qrCodeImageUrl).length,
                totalTickets: updatedOrder.tickets.length,
              },
            };
          }
        }

      } catch (error: any) {
        testResults.steps.error = {
          success: false,
          error: error.message,
          step: "order processing",
        };
      }
    } else if (testType === "qr-only" && orderId) {
      // Test QR generation only
      console.log("📋 Testing QR generation only...");
      
      try {
        const qrResult = await generateTransactionQRCodes(orderId);
        
        testResults.steps.qrGeneration = {
          success: qrResult.success,
          data: {
            generatedCount: qrResult.generatedCount,
            errors: qrResult.errors,
          },
        };
      } catch (error: any) {
        testResults.steps.qrGeneration = {
          success: false,
          error: error.message,
        };
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid test type or missing orderId. Use testType: 'complete' or 'qr-only' with orderId",
        },
        { status: 400 }
      );
    }

    // Calculate overall success
    const allSteps = Object.values(testResults.steps);
    const successfulSteps = allSteps.filter((step: any) => step.success);
    const overallSuccess = successfulSteps.length === allSteps.length && allSteps.length > 0;

    console.log(`🎯 Payment QR email flow test completed: ${successfulSteps.length}/${allSteps.length} steps successful`);

    return NextResponse.json({
      success: overallSuccess,
      message: `Payment QR email flow test completed: ${successfulSteps.length}/${allSteps.length} steps passed`,
      results: testResults,
      summary: {
        totalSteps: allSteps.length,
        successfulSteps: successfulSteps.length,
        failedSteps: allSteps.length - successfulSteps.length,
        overallSuccess,
      },
    });
  } catch (error: any) {
    console.error("❌ Payment QR email flow test error:", error);
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
 * GET /api/test/payment-qr-email-flow
 * Get information about available payment flow tests
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Payment QR email flow testing endpoint",
    availableTests: [
      {
        type: "complete",
        description: "Test complete flow: order fetch → QR generation → email delivery",
        required: ["orderId"],
      },
      {
        type: "qr-only",
        description: "Test QR code generation only",
        required: ["orderId"],
      },
    ],
    usage: {
      method: "POST",
      body: {
        testType: "complete|qr-only",
        orderId: "transaction-id-to-test",
        email: "optional-email-override@example.com",
      },
    },
    timestamp: new Date().toISOString(),
  });
}
