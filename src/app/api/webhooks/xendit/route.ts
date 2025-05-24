import { NextRequest, NextResponse } from "next/server";
import { handlePaymentCallback } from "~/server/api/checkout";
import { verifyWebhookSignature } from "~/lib/xendit";
import { env } from "~/env";

/**
 * POST /api/webhooks/xendit
 * Handle Xendit payment webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Get signature from headers
    const signature = request.headers.get('x-callback-token') || '';
    
    // Verify webhook signature if webhook token is configured
    if (env.XENDIT_WEBHOOK_TOKEN) {
      const isValid = verifyWebhookSignature(rawBody, signature, env.XENDIT_WEBHOOK_TOKEN);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json(
          { success: false, error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // Parse webhook payload
    const webhookData = JSON.parse(rawBody);
    
    console.log('Received Xendit webhook:', webhookData);

    // Extract payment information from webhook
    const {
      id: paymentId,
      status,
      reference_id: orderId,
      payment_id: paymentReference,
      metadata,
    } = webhookData;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: "Missing payment ID" },
        { status: 400 }
      );
    }

    // Process payment callback
    const result = await handlePaymentCallback({
      orderId: orderId || metadata?.orderId,
      paymentId,
      status: 'PENDING', // Will be overridden by xenditStatus
      paymentReference,
      callbackPayload: webhookData,
      xenditStatus: status,
    });

    console.log('Payment callback processed:', result);

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });

  } catch (error: any) {
    console.error("Error processing Xendit webhook:", error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to process webhook" 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/xendit
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Xendit webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
