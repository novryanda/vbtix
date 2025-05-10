import { env } from "~/env.js";
import { Order, Payment } from "@prisma/client";
import { createPayment, updatePayment, processSuccessfulPayment, processFailedPayment, processExpiredPayment } from "~/server/services/payment.service";

// Midtrans API configuration
const MIDTRANS_SERVER_KEY = env.MIDTRANS_SERVER_KEY || "";
const MIDTRANS_CLIENT_KEY = env.MIDTRANS_CLIENT_KEY || "";
const MIDTRANS_API_URL = env.NODE_ENV === "production"
  ? "https://api.midtrans.com"
  : "https://api.sandbox.midtrans.com";

// Encode server key for Basic Auth
const encodedServerKey = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");

/**
 * Create a Midtrans Snap payment for an order
 */
export async function createMidtransPayment(order: Order, customerDetails: {
  firstName: string;
  email: string;
  phone?: string;
}): Promise<{
  success: boolean;
  token?: string;
  redirectUrl?: string;
  payment?: Payment;
  error?: string;
}> {
  try {
    // Create a unique order ID for Midtrans
    const midtransOrderId = `ORDER-${order.id}-${Date.now()}`;

    // Prepare the payment request
    const paymentRequest = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: order.totalAmount.toNumber(),
      },
      customer_details: {
        first_name: customerDetails.firstName,
        email: customerDetails.email,
        phone: customerDetails.phone || "",
      },
      item_details: [
        {
          id: order.id,
          price: order.totalAmount.toNumber(),
          quantity: 1,
          name: `Payment for Order #${order.id}`,
        },
      ],
      callbacks: {
        finish: `${env.NEXTAUTH_URL}/checkout/success?order_id=${order.id}`,
        error: `${env.NEXTAUTH_URL}/checkout/cancel?order_id=${order.id}`,
        pending: `${env.NEXTAUTH_URL}/checkout/pending?order_id=${order.id}`,
      },
    };

    // Make the API request to Midtrans
    const response = await fetch(`${MIDTRANS_API_URL}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${encodedServerKey}`,
      },
      body: JSON.stringify(paymentRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Midtrans API error:", data);
      return {
        success: false,
        error: data.error_messages?.[0] || "Failed to create payment",
      };
    }

    // Create a payment record in our database
    const payment = await createPayment({
      orderId: order.id,
      gateway: "midtrans",
      amount: order.totalAmount.toNumber(),
      paymentId: midtransOrderId,
    });

    return {
      success: true,
      token: data.token,
      redirectUrl: data.redirect_url,
      payment,
    };
  } catch (error) {
    console.error("Error creating Midtrans payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create payment",
    };
  }
}

/**
 * Get Midtrans payment status
 */
export async function getMidtransPaymentStatus(orderId: string): Promise<{
  success: boolean;
  status?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${MIDTRANS_API_URL}/v2/${orderId}/status`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Basic ${encodedServerKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Midtrans API error:", data);
      return {
        success: false,
        error: data.error_messages?.[0] || "Failed to get payment status",
      };
    }

    return {
      success: true,
      status: data.transaction_status,
    };
  } catch (error) {
    console.error("Error getting Midtrans payment status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get payment status",
    };
  }
}

/**
 * Handle Midtrans webhook notification
 */
export async function handleMidtransWebhook(notification: any): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate the notification
    if (!notification || !notification.transaction_status || !notification.order_id) {
      return {
        success: false,
        error: "Invalid notification data",
      };
    }

    // Extract the payment ID from the order ID
    // Format: ORDER-{orderId}-{timestamp}
    const orderIdParts = notification.order_id.split("-");
    if (orderIdParts.length < 3 || orderIdParts[0] !== "ORDER") {
      return {
        success: false,
        error: "Invalid order ID format",
      };
    }

    // Find the payment by external payment ID
    const payment = await findPaymentByExternalId(notification.order_id);
    if (!payment) {
      return {
        success: false,
        error: "Payment not found",
      };
    }

    // Update the payment with the notification data
    await updatePayment(payment.id, {
      callbackPayload: notification,
      receivedAt: new Date(),
    });

    // Process the payment based on the transaction status
    switch (notification.transaction_status) {
      case "capture":
      case "settlement":
        // Payment successful
        await processSuccessfulPayment(payment.id);
        break;
      case "deny":
      case "cancel":
      case "failure":
        // Payment failed
        await processFailedPayment(payment.id);
        break;
      case "expire":
        // Payment expired
        await processExpiredPayment(payment.id);
        break;
      case "pending":
        // Payment pending, no action needed
        break;
      default:
        console.warn(`Unhandled transaction status: ${notification.transaction_status}`);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error handling Midtrans webhook:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process webhook",
    };
  }
}

/**
 * Find payment by external payment ID
 */
async function findPaymentByExternalId(paymentId: string): Promise<Payment | null> {
  // Import here to avoid circular dependency
  const { findPaymentByExternalId } = await import("~/server/services/payment.service");
  return findPaymentByExternalId(paymentId);
}