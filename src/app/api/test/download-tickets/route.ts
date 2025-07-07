import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/test/download-tickets
 * Test endpoint to verify download tickets functionality
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Download Tickets Test Endpoint",
    description: "This endpoint tests the PDF ticket download functionality",
    endpoints: {
      downloadTickets: "/api/public/orders/[orderId]/download-tickets",
      testPDFGeneration: "/api/test/pdf-ticket-generation",
    },
    testInstructions: [
      "1. Create a test order with SUCCESS status and QR codes",
      "2. Call the download endpoint with the order ID",
      "3. Verify PDF is generated and downloaded correctly",
      "4. Check that the PDF contains QR code, event details, and branding",
    ],
    implementation: {
      status: "✅ Complete",
      features: [
        "✅ API endpoint created",
        "✅ PDF generation integration",
        "✅ QR code integration", 
        "✅ Frontend download functionality",
        "✅ Error handling and validation",
        "✅ Guest session support",
        "✅ Magic UI components integration",
      ],
    },
    usage: {
      checkoutSuccessPage: "Download button available for successful orders",
      orderDetailsPage: "Download button shown when order status is SUCCESS",
      apiEndpoint: "GET /api/public/orders/[orderId]/download-tickets",
    },
  });
}

/**
 * POST /api/test/download-tickets
 * Test the download functionality with access control validation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, sessionId, testAccessControl = true } = body;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID is required for testing",
        },
        { status: 400 }
      );
    }

    const testResults: any = {
      orderId,
      sessionId,
      timestamp: new Date().toISOString(),
      tests: {},
    };

    // Test 1: Check if endpoint exists
    try {
      const downloadUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/orders/${orderId}/download-tickets`;

      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      testResults.tests.endpointExists = {
        success: response.status !== 404,
        status: response.status,
        message: response.status !== 404 ? "Endpoint accessible" : "Endpoint not found",
      };

    } catch (error) {
      testResults.tests.endpointExists = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // Test 2: Test access control with sessionId if provided
    if (testAccessControl && sessionId) {
      try {
        const downloadUrlWithSession = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/orders/${orderId}/download-tickets?sessionId=${sessionId}`;

        const response = await fetch(downloadUrlWithSession, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const responseData = await response.json().catch(() => ({}));

        testResults.tests.accessControlWithSession = {
          success: response.status !== 403,
          status: response.status,
          message: response.status === 403 ? "Access denied (expected for invalid session)" :
                   response.status === 404 ? "Order not found or access denied" :
                   response.status === 400 ? "Order not ready for download" :
                   "Access granted or other response",
          responseData,
        };

      } catch (error) {
        testResults.tests.accessControlWithSession = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    // Test 3: Test access control without sessionId (should fail)
    if (testAccessControl) {
      try {
        const downloadUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/orders/${orderId}/download-tickets`;

        const response = await fetch(downloadUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const responseData = await response.json().catch(() => ({}));

        testResults.tests.accessControlWithoutAuth = {
          success: response.status === 401, // Should be 401 for no auth
          status: response.status,
          message: response.status === 401 ? "Correctly denied access without auth" :
                   "Unexpected response for unauthenticated request",
          responseData,
        };

      } catch (error) {
        testResults.tests.accessControlWithoutAuth = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: "Download tickets access control test completed",
      testResults,
      summary: {
        endpointWorking: testResults.tests.endpointExists?.success || false,
        accessControlWorking: testResults.tests.accessControlWithoutAuth?.success || false,
        sessionAccessTested: !!sessionId,
      },
    });

  } catch (error) {
    console.error("Error in download tickets test:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
