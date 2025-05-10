import { db } from "~/server/db/client";
import { Payment, PaymentStatus, Prisma } from "@prisma/client";
import { getOrderById, updateOrder } from "./order.service";
import { OrderStatus } from "@prisma/client";

type PaymentCreateInput = {
  orderId: string;
  gateway: string;
  amount: number;
  status?: PaymentStatus;
  paymentId?: string;
};

type PaymentUpdateInput = {
  status?: PaymentStatus;
  paymentId?: string;
  hmacSignature?: string;
  callbackPayload?: Record<string, any>;
  receivedAt?: Date;
};

type PaymentWithDetails = Prisma.PaymentGetPayload<{
  include: {
    order: {
      include: {
        items: true;
        event: true;
        user: true;
      }
    }
  }
}>;

/**
 * Create a new payment
 */
export async function createPayment(data: PaymentCreateInput): Promise<Payment> {
  // Start a transaction to ensure all operations succeed or fail together
  return db.$transaction(async (tx) => {
    // Get the order to make sure it exists
    const order = await getOrderById(data.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Check if order is in a valid state for payment
    if (order.status !== OrderStatus.PENDING) {
      throw new Error(`Cannot create payment for order with status ${order.status}`);
    }

    // Convert amount to Decimal
    const amountDecimal = new Prisma.Decimal(data.amount);

    // Create the payment
    const payment = await tx.payment.create({
      data: {
        orderId: data.orderId,
        gateway: data.gateway,
        amount: amountDecimal,
        status: data.status || PaymentStatus.PENDING,
        paymentId: data.paymentId,
      },
    });

    return payment;
  });
}

/**
 * Get all payments with optional filtering
 */
export async function getPayments(filters: {
  orderId?: string;
  status?: PaymentStatus;
  gateway?: string;
  limit?: number;
  offset?: number;
}): Promise<Payment[]> {
  const { orderId, status, gateway, limit = 10, offset = 0 } = filters;

  return db.payment.findMany({
    where: {
      orderId: orderId,
      status: status,
      gateway: gateway,
    },
    take: limit,
    skip: offset,
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Get a payment by ID
 */
export async function getPaymentById(id: string): Promise<PaymentWithDetails | null> {
  return db.payment.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          items: true,
          event: true,
          user: true,
        },
      },
    },
  });
}

/**
 * Update a payment
 */
export async function updatePayment(id: string, data: PaymentUpdateInput): Promise<Payment> {
  return db.payment.update({
    where: { id },
    data,
  });
}

/**
 * Process a successful payment
 */
export async function processSuccessfulPayment(paymentId: string): Promise<Payment> {
  // Start a transaction to ensure all operations succeed or fail together
  return db.$transaction(async (tx) => {
    // Get the payment with order
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    // Update payment status
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.SUCCESS,
        receivedAt: new Date(),
      },
    });

    // Update order status
    await tx.order.update({
      where: { id: payment.orderId },
      data: {
        status: OrderStatus.PAID,
        expiresAt: null, // Remove expiration
      },
    });

    return updatedPayment;
  });
}

/**
 * Process a failed payment
 */
export async function processFailedPayment(paymentId: string): Promise<Payment> {
  return db.payment.update({
    where: { id: paymentId },
    data: {
      status: PaymentStatus.FAILED,
      receivedAt: new Date(),
    },
  });
}

/**
 * Process an expired payment
 */
export async function processExpiredPayment(paymentId: string): Promise<Payment> {
  return db.payment.update({
    where: { id: paymentId },
    data: {
      status: PaymentStatus.EXPIRED,
      receivedAt: new Date(),
    },
  });
}

/**
 * Get payments by order ID
 */
export async function getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
  return db.payment.findMany({
    where: { orderId },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Find payment by external payment ID
 */
export async function findPaymentByExternalId(paymentId: string): Promise<Payment | null> {
  return db.payment.findFirst({
    where: { paymentId },
  });
}