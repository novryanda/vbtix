import { prisma } from "~/server/db";
import { PaymentStatus } from "@prisma/client";

/**
 * Get a payment by ID
 */
export async function handleGetPaymentById(paymentId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            event: {
              select: {
                id: true,
                title: true,
              },
            },
            orderItems: {
              include: {
                ticketType: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return {
        success: false,
        error: "Payment not found",
      };
    }

    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    console.error("Error getting payment by ID:", error);
    return {
      success: false,
      error: "Failed to get payment",
    };
  }
}

/**
 * Update a payment
 */
export async function handleUpdatePayment(
  paymentId: string,
  data: {
    status?: PaymentStatus;
    paymentReference?: string;
    callbackPayload?: any;
  },
) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return {
        success: false,
        error: "Payment not found",
      };
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            event: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: updatedPayment,
    };
  } catch (error) {
    console.error("Error updating payment:", error);
    return {
      success: false,
      error: "Failed to update payment",
    };
  }
}
