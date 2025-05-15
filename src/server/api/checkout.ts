import { prisma } from "~/server/db";
import { PaymentStatus } from "@prisma/client";

/**
 * Initiate checkout process
 */
export async function handleInitiateCheckout(params: {
  orderId: string;
  userId: string;
  paymentMethod: string;
}) {
  const { orderId, userId, paymentMethod } = params;

  // Get order
  const order = await prisma.transaction.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      orderItems: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Check if order can be checked out
  if (order.status !== "PENDING") {
    throw new Error("Only pending orders can be checked out");
  }

  // Update order with payment method
  const updatedOrder = await prisma.transaction.update({
    where: { id: orderId },
    data: {
      paymentMethod,
    },
  });

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      orderId,
      gateway: paymentMethod,
      amount: order.amount,
      status: "PENDING",
    },
  });

  // Here you would typically integrate with a payment gateway
  // For now, we'll simulate a payment gateway response
  const paymentGatewayResponse = simulatePaymentGateway(order, paymentMethod);

  return {
    order: updatedOrder,
    payment,
    checkoutUrl: paymentGatewayResponse.redirectUrl,
    paymentToken: paymentGatewayResponse.token,
  };
}

/**
 * Process payment callback
 */
export async function handlePaymentCallback(params: {
  orderId: string;
  paymentId: string;
  status: PaymentStatus;
  paymentReference?: string;
  callbackPayload?: any;
}) {
  const { orderId, paymentId, status, paymentReference, callbackPayload } = params;

  // Get order and payment
  const [order, payment] = await Promise.all([
    prisma.transaction.findUnique({
      where: { id: orderId },
      include: {
        tickets: true,
        orderItems: true,
      },
    }),
    prisma.payment.findUnique({
      where: { id: paymentId },
    }),
  ]);

  if (!order || !payment) {
    throw new Error("Order or payment not found");
  }

  // Update payment status
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status,
      paymentId: paymentReference,
      callbackPayload,
      receivedAt: new Date(),
    },
  });

  // Update order status based on payment status
  let updatedOrder;
  if (status === "SUCCESS") {
    // Process successful payment
    updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order
      const updated = await tx.transaction.update({
        where: { id: orderId },
        data: {
          status: "SUCCESS",
          paymentReference,
        },
      });

      // Update ticket statuses if needed
      if (order.status !== "SUCCESS") {
        await tx.ticket.updateMany({
          where: { transactionId: orderId },
          data: {
            status: "ACTIVE",
          },
        });

        // Generate e-tickets
        const tickets = order.tickets.map(ticket => ({
          orderId,
          qrCodeData: ticket.qrCode,
          generatedAt: new Date(),
        }));

        if (tickets.length > 0) {
          await tx.eTicket.createMany({
            data: tickets,
          });
        }
      }

      return updated;
    });
  } else if (status === "FAILED") {
    // Process failed payment
    updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order
      const updated = await tx.transaction.update({
        where: { id: orderId },
        data: {
          status: "FAILED",
        },
      });

      // Restore ticket type quantities if needed
      if (order.status === "PENDING") {
        for (const item of order.orderItems) {
          await tx.ticketType.update({
            where: { id: item.ticketTypeId },
            data: {
              sold: {
                decrement: item.quantity,
              },
            },
          });
        }

        // Update ticket statuses
        await tx.ticket.updateMany({
          where: { transactionId: orderId },
          data: {
            status: "CANCELLED",
          },
        });
      }

      return updated;
    });
  } else {
    // For other statuses, just update the order status
    updatedOrder = await prisma.transaction.update({
      where: { id: orderId },
      data: {
        status,
      },
    });
  }

  return {
    order: updatedOrder,
    payment: updatedPayment,
  };
}

/**
 * Simulate payment gateway response
 * This is a placeholder for actual payment gateway integration
 */
function simulatePaymentGateway(order: any, paymentMethod: string) {
  // In a real implementation, this would call an actual payment gateway API
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  return {
    success: true,
    token: `payment_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    redirectUrl: `${baseUrl}/checkout/payment?orderId=${order.id}&method=${paymentMethod}`,
  };
}
