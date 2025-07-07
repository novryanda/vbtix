import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/server/db";

/**
 * POST /api/test/status-endpoint-fix
 * Test the fixed status endpoint with proper guest user logic
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    console.log(`🧪 Testing status endpoint fix for order: ${orderId}`);

    const testResults: any = {
      orderId,
      timestamp: new Date().toISOString(),
      tests: {},
    };

    // Test 1: Check if order exists and get user info
    console.log("🔍 Test 1: Checking order and user info...");
    const order = await prisma.transaction.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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
      },
    });

    if (!order) {
      testResults.tests.orderExists = {
        success: false,
        error: "Order not found",
      };
      return NextResponse.json({
        success: false,
        error: "Order not found",
        debug: testResults,
      });
    }

    const isGuestUser = order.user.phone?.startsWith("guest_");
    const sessionId = isGuestUser ? order.user.phone?.replace("guest_", "") : null;

    testResults.tests.orderExists = {
      success: true,
      data: {
        id: order.id,
        status: order.status,
        userId: order.user.id,
        userPhone: order.user.phone,
        isGuestUser,
        sessionId,
      },
    };

    // Test 2: Test authenticated user access (if not guest)
    if (!isGuestUser) {
      console.log("🔍 Test 2: Testing authenticated user access...");
      try {
        const authOrder = await prisma.transaction.findFirst({
          where: {
            id: orderId,
            userId: order.user.id,
          },
          select: {
            id: true,
            status: true,
            paymentMethod: true,
          },
        });

        testResults.tests.authenticatedAccess = {
          success: !!authOrder,
          data: authOrder ? {
            found: true,
            status: authOrder.status,
          } : {
            found: false,
          },
        };
      } catch (error: any) {
        testResults.tests.authenticatedAccess = {
          success: false,
          error: error.message,
        };
      }
    }

    // Test 3: Test guest user access (if guest)
    if (isGuestUser && sessionId) {
      console.log("🔍 Test 3: Testing guest user access...");
      try {
        const guestOrder = await prisma.transaction.findFirst({
          where: {
            id: orderId,
            user: {
              phone: `guest_${sessionId}`,
            },
          },
          select: {
            id: true,
            status: true,
            paymentMethod: true,
            user: {
              select: {
                phone: true,
              },
            },
          },
        });

        testResults.tests.guestAccess = {
          success: !!guestOrder,
          data: guestOrder ? {
            found: true,
            status: guestOrder.status,
            userPhone: guestOrder.user.phone,
          } : {
            found: false,
          },
        };
      } catch (error: any) {
        testResults.tests.guestAccess = {
          success: false,
          error: error.message,
        };
      }
    }

    // Test 4: Test the actual status endpoint logic
    console.log("🔍 Test 4: Testing status endpoint logic...");
    try {
      // Simulate the exact logic from the status endpoint
      let whereClause: any = {
        id: orderId,
      };

      if (!isGuestUser) {
        // For authenticated users
        whereClause.userId = order.user.id;
      } else if (sessionId) {
        // For guest users
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

      if (statusOrder) {
        const hasQRCodes = statusOrder.tickets.some(
          (ticket) => ticket.qrCodeImageUrl && ticket.qrCodeStatus === "ACTIVE"
        );

        const latestPaymentStatus = statusOrder.payments[0]?.status || null;

        let overallStatus: string = statusOrder.status;
        
        if (
          statusOrder.status === "PENDING" &&
          statusOrder.paymentMethod === "MANUAL_PAYMENT" &&
          !latestPaymentStatus
        ) {
          overallStatus = "AWAITING_VERIFICATION";
        }

        testResults.tests.statusEndpointLogic = {
          success: true,
          data: {
            orderId: statusOrder.id,
            status: overallStatus,
            paymentStatus: latestPaymentStatus,
            paymentMethod: statusOrder.paymentMethod,
            hasQRCodes,
            lastUpdated: statusOrder.updatedAt.toISOString(),
            createdAt: statusOrder.createdAt.toISOString(),
            userPhone: statusOrder.user.phone,
          },
        };
      } else {
        testResults.tests.statusEndpointLogic = {
          success: false,
          error: "Order not found with status endpoint logic",
        };
      }
    } catch (error: any) {
      testResults.tests.statusEndpointLogic = {
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
      userType: isGuestUser ? "guest" : "authenticated",
      sessionId: sessionId || "N/A",
    };

    console.log(`✅ Status endpoint fix test completed: ${successfulTests}/${totalTests} tests passed`);

    return NextResponse.json({
      success: true,
      message: `Status endpoint fix test completed: ${successfulTests}/${totalTests} tests passed`,
      debug: testResults,
    });
  } catch (error: any) {
    console.error("❌ Status endpoint fix test failed:", error);
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
 * GET /api/test/status-endpoint-fix
 * Get test instructions
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Status Endpoint Fix Test",
    instructions: {
      description: "Test the fixed status endpoint with proper guest user logic",
      usage: {
        method: "POST",
        body: {
          orderId: "string (required) - The order ID to test",
        },
      },
      example: {
        curl: `curl -X POST http://localhost:3000/api/test/status-endpoint-fix \\
  -H "Content-Type: application/json" \\
  -d '{"orderId": "cmbxgyo6m0004uoz0ocvtehpm"}'`,
      },
      notes: [
        "This endpoint tests the fixed status endpoint logic",
        "It checks both authenticated and guest user access patterns",
        "Verifies the database query logic matches the existing order endpoint",
        "Tests the exact where clause logic used in the status endpoint",
      ],
    },
  });
}
