import { NextRequest, NextResponse } from "next/server";
import { emailService } from "~/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Starting email verification flow test...");

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
          details: jsonError instanceof Error ? jsonError.message : "JSON parsing failed",
          example: {
            email: "test@example.com",
            userName: "Test User"
          }
        },
        { status: 400 }
      );
    }

    const { email, userName = "Test User" } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required" },
        { status: 400 }
      );
    }

    console.log(`📧 Testing email verification flow for: ${email}`);

    // Test verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'https://vbticket.com'}/verify/sample-token-123`;
    
    const result = await emailService.sendAccountVerification({
      to: email,
      userName,
      verificationUrl,
    });

    console.log("📧 Email verification test result:", result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email verification test completed successfully",
        data: {
          email,
          userName,
          verificationUrl,
          messageId: result.messageId,
          domain: "vbticket.com"
        }
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send verification email",
          details: result.error
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Email verification flow test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Email Verification Flow Test Endpoint",
    usage: "POST with { email: 'test@example.com', userName: 'Test User' }",
    description: "Tests the complete email verification flow with vbticket.com domain",
    endpoints: {
      test: "POST /api/test/email-verification-flow",
      verify: "POST /api/auth/verify",
      resend: "POST /api/auth/resend-verification"
    }
  });
}
