import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/server/db";
import { handleUpdateOrganizerOrderStatus } from "~/server/api/organizer-orders";
import { handleUpdateOrderStatus } from "~/server/api/admin-orders";
import { PaymentStatus } from "@prisma/client";

/**
 * POST /api/test/payment-verification-flow
 * Test the complete payment verification flow including real-time updates and email delivery
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, action = "test-organizer-verification", userId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    console.log(`🧪 Testing payment verification flow for order: ${orderId}, action: ${action}`);

    const testResults: any = {
      orderId,
      action,
      timestamp: new Date().toISOString(),
      tests: {},
    };

    // Test 1: Check initial order state
    console.log("🔍 Test 1: Checking initial order state...");
    const initialOrder = await prisma.transaction.findUnique({
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

    if (!initialOrder) {
      testResults.tests.initialOrderState = {
        success: false,
        error: "Order not found",
      };
      return NextResponse.json({
        success: false,
        error: "Order not found",
        debug: testResults,
      });
    }

    testResults.tests.initialOrderState = {
      success: true,
      data: {
        id: initialOrder.id,
        status: initialOrder.status,
        paymentMethod: initialOrder.paymentMethod,
        ticketCount: initialOrder.tickets.length,
        hasQRCodes: initialOrder.tickets.some(t => t.qrCodeImageUrl),
        emailTo: initialOrder.buyerInfo?.email || initialOrder.user.email,
      },
    };

    // Test 2: Simulate payment verification
    if (action === "test-organizer-verification" || action === "test-all") {
      console.log("🔍 Test 2: Testing organizer payment verification...");
      try {
        if (!userId) {
          testResults.tests.organizerVerification = {
            success: false,
            error: "userId required for organizer verification test",
          };
        } else {
          const verificationResult = await handleUpdateOrganizerOrderStatus({
            userId,
            orderId,
            status: PaymentStatus.SUCCESS,
            notes: "Test verification - payment approved",
          });

          testResults.tests.organizerVerification = {
            success: true,
            data: {
              orderId: verificationResult.id,
              newStatus: verificationResult.status,
              verifiedAt: new Date().toISOString(),
            },
          };
        }
      } catch (error: any) {
        testResults.tests.organizerVerification = {
          success: false,
          error: error.message,
        };
      }
    }

    if (action === "test-admin-verification" || action === "test-all") {
      console.log("🔍 Test 3: Testing admin payment verification...");
      try {
        if (!userId) {
          testResults.tests.adminVerification = {
            success: false,
            error: "userId required for admin verification test",
          };
        } else {
          const verificationResult = await handleUpdateOrderStatus({
            orderId,
            status: PaymentStatus.SUCCESS,
            notes: "Test verification - payment approved by admin",
            adminId: userId,
          });

          testResults.tests.adminVerification = {
            success: true,
            data: {
              orderId: verificationResult.id,
              newStatus: verificationResult.status,
              verifiedAt: new Date().toISOString(),
            },
          };
        }
      } catch (error: any) {
        testResults.tests.adminVerification = {
          success: false,
          error: error.message,
        };
      }
    }

    // Test 4: Check final order state after verification
    console.log("🔍 Test 4: Checking final order state...");
    const finalOrder = await prisma.transaction.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        tickets: {
          select: {
            id: true,
            qrCodeImageUrl: true,
            qrCodeStatus: true,
          },
        },
        payments: {
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
      },
    });

    if (finalOrder) {
      const hasQRCodes = finalOrder.tickets.some(
        (ticket) => ticket.qrCodeImageUrl && ticket.qrCodeStatus === "ACTIVE"
      );

      testResults.tests.finalOrderState = {
        success: true,
        data: {
          id: finalOrder.id,
          status: finalOrder.status,
          hasQRCodes,
          qrCodeCount: finalOrder.tickets.filter(t => t.qrCodeImageUrl).length,
          totalTickets: finalOrder.tickets.length,
          latestPaymentStatus: finalOrder.payments[0]?.status || null,
          statusChanged: initialOrder.status !== finalOrder.status,
        },
      };
    } else {
      testResults.tests.finalOrderState = {
        success: false,
        error: "Order not found after verification",
      };
    }

    // Test 5: Test real-time status endpoint
    console.log("🔍 Test 5: Testing real-time status endpoint...");
    try {
      // Simulate the status endpoint call
      const sessionId = initialOrder.user.phone?.startsWith("guest_") 
        ? initialOrder.user.phone.replace("guest_", "") 
        : null;

      let whereClause: any = { id: orderId };
      
      if (!sessionId) {
        // Authenticated user
        whereClause.userId = initialOrder.userId;
      } else {
        // Guest user
        whereClause.user = {
          phone: `guest_${sessionId}`,
        };
      }

      const statusOrder = await prisma.transaction.findFirst({
        where: whereClause,
        select: {
          id: true,
          status: true,
          paymentMethod: true,
          updatedAt: true,
          user: {
            select: {
              phone: true,
            },
          },
          tickets: {
            select: {
              qrCodeImageUrl: true,
              qrCodeStatus: true,
            },
          },
          payments: {
            select: {
              status: true,
            },
            orderBy: {
              updatedAt: "desc",
            },
            take: 1,
          },
        },
      });

      if (statusOrder) {
        const hasQRCodes = statusOrder.tickets.some(
          (ticket) => ticket.qrCodeImageUrl && ticket.qrCodeStatus === "ACTIVE"
        );

        testResults.tests.realtimeStatusEndpoint = {
          success: true,
          data: {
            orderId: statusOrder.id,
            status: statusOrder.status,
            hasQRCodes,
            lastUpdated: statusOrder.updatedAt.toISOString(),
            userType: sessionId ? "guest" : "authenticated",
          },
        };
      } else {
        testResults.tests.realtimeStatusEndpoint = {
          success: false,
          error: "Order not found with real-time status logic",
        };
      }
    } catch (error: any) {
      testResults.tests.realtimeStatusEndpoint = {
        success: false,
        error: error.message,
      };
    }

    // Summary
    const successfulTests = Object.values(testResults.tests).filter((test: any) => test.success).length;
    const totalTests = Object.keys(testResults.tests).length;

    testResults.summary = {
      successfulTests,
      totalTests,
      allPassed: successfulTests === totalTests,
      statusChanged: testResults.tests.finalOrderState?.data?.statusChanged || false,
      hasQRCodes: testResults.tests.finalOrderState?.data?.hasQRCodes || false,
      emailShouldBeSent: testResults.tests.finalOrderState?.data?.status === "SUCCESS",
    };

    console.log(`✅ Payment verification flow test completed: ${successfulTests}/${totalTests} tests passed`);

    return NextResponse.json({
      success: true,
      message: `Payment verification flow test completed: ${successfulTests}/${totalTests} tests passed`,
      debug: testResults,
    });
  } catch (error: any) {
    console.error("❌ Payment verification flow test failed:", error);
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
 * GET /api/test/payment-verification-flow
 * Get test instructions
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Payment Verification Flow Test",
    instructions: {
      description: "Test the complete payment verification flow including real-time updates and email delivery",
      usage: {
        method: "POST",
        body: {
          orderId: "string (required) - The order ID to test",
          action: "string (optional) - test-organizer-verification | test-admin-verification | test-all",
          userId: "string (required for verification tests) - The user ID performing the verification",
        },
      },
      actions: {
        "test-organizer-verification": "Test organizer payment verification flow",
        "test-admin-verification": "Test admin payment verification flow",
        "test-all": "Test both verification flows",
      },
      example: {
        curl: `curl -X POST http://localhost:3000/api/test/payment-verification-flow \\
  -H "Content-Type: application/json" \\
  -d '{"orderId": "order-id", "action": "test-organizer-verification", "userId": "user-id"}'`,
      },
    },
  });
}
