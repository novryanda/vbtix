import { NextRequest, NextResponse } from "next/server";
import { handleMidtransWebhook } from "~/server/integrations/payment/midtrans";

/**
 * POST /api/payments/midtrans/webhook
 * Handle Midtrans payment notifications
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const notification = await request.json();

    // Handle the webhook
    const result = await handleMidtransWebhook(notification);

    if (!result.success) {
      console.error("Midtrans webhook error:", result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in Midtrans webhook handler:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}