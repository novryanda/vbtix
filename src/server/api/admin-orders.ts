import { prisma } from "~/server/db";
import { PaymentStatus } from "@prisma/client";
import { formatDate } from "~/lib/utils";
// Note: QR generation and email service removed - handled by organizer approval

/**
 * Get all orders for admin with filtering and pagination
 */
export async function handleGetAdminOrders(params: {
  page?: number | string;
  limit?: number | string;
  status?: PaymentStatus | "MANUAL_PENDING";
  search?: string;
}) {
  const { page = 1, limit = 10, status, search } = params;

  // Validate parameters
  const validPage = Math.max(1, Number(page));
  const validLimit = Math.min(100, Math.max(1, Number(limit)));
  const skip = (validPage - 1) * validLimit;

  // Build where clause
  const where: any = {};

  // Add status filter
  if (status) {
    if (status === "MANUAL_PENDING") {
      // Filter for manual payments and QRIS By Wonders awaiting verification
      where.status = "PENDING";
      where.paymentMethod = {
        in: ["MANUAL_PAYMENT", "QRIS_BY_WONDERS"]
      };
      where.details = {
        path: ["awaitingVerification"],
        equals: true,
      };
    } else {
      where.status = status;
    }
  }

  // Add search filter
  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { event: { title: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Get orders with pagination
  const [orders, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: validLimit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            venue: true,
            organizer: {
              select: {
                id: true,
                orgName: true,
              },
            },
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
        payments: {
          select: {
            id: true,
            gateway: true,
            status: true,
            paymentId: true,
            createdAt: true,
          },
        },
        tickets: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  // Format orders for response
  const formattedOrders = orders.map((order) => ({
    id: order.id,
    invoiceNumber: order.invoiceNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    amount: Number(order.amount),
    currency: order.currency,
    details: order.details,
    createdAt: order.createdAt.toISOString(),
    formattedCreatedAt: formatDate(order.createdAt),
    user: {
      id: order.user.id,
      name: order.user.name,
      email: order.user.email,
      phone: order.user.phone,
    },
    event: {
      id: order.event.id,
      title: order.event.title,
      startDate: order.event.startDate?.toISOString(),
      formattedStartDate: order.event.startDate ? formatDate(order.event.startDate) : null,
      venue: order.event.venue,
      organizer: order.event.organizer,
    },
    items: order.orderItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      subtotal: Number(item.price) * item.quantity,
      ticketType: {
        id: item.ticketType.id,
        name: item.ticketType.name,
        price: Number(item.ticketType.price),
      },
    })),
    payments: order.payments.map((payment) => ({
      id: payment.id,
      gateway: payment.gateway,
      status: payment.status,
      paymentId: payment.paymentId,
      createdAt: payment.createdAt.toISOString(),
      formattedCreatedAt: formatDate(payment.createdAt),
    })),
    tickets: order.tickets.map((ticket) => ({
      id: ticket.id,
      status: ticket.status,
    })),
  }));

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / validLimit);

  return {
    orders: formattedOrders,
    meta: {
      currentPage: validPage,
      totalPages,
      totalItems: total,
      itemsPerPage: validLimit,
    },
  };
}

/**
 * Update order status (for manual payment verification)
 */
export async function handleUpdateOrderStatus(params: {
  orderId: string;
  status: PaymentStatus;
  notes?: string;
  adminId: string;
}) {
  const { orderId, status, notes, adminId } = params;

  // Get the order first
  const order = await prisma.transaction.findUnique({
    where: { id: orderId },
    include: {
      payments: true,
      tickets: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Update order status
  const updatedOrder = await prisma.transaction.update({
    where: { id: orderId },
    data: {
      status,
      details: {
        ...(order.details as any),
        awaitingVerification: false,
        verifiedAt: new Date().toISOString(),
        verifiedBy: adminId,
        verificationNotes: notes,
      },
    },
  });

  // Update payment status if exists
  if (order.payments.length > 0) {
    await prisma.payment.updateMany({
      where: { orderId },
      data: { status },
    });
  }

  // Admin approval only handles payment verification, NOT sales counting
  // Sales counting and ticket activation is handled by organizer approval
  if (status === "SUCCESS") {
    console.log(`✅ Admin approved payment for order ${order.id} - payment verification complete`);
    console.log(`ℹ️  Note: Tickets remain PENDING until organizer approval for sales counting`);

    // Admin approval does NOT:
    // - Increment sold count (organizer handles this)
    // - Activate tickets (organizer handles this)
    // - Generate QR codes (organizer handles this)
    // - Send customer emails (organizer handles this)

    // Admin approval only verifies payment legitimacy
  }

  // If rejected, cancel tickets and restore inventory
  if (status === "FAILED") {
    await prisma.$transaction(async (tx) => {
      // Cancel all tickets for this transaction
      await tx.ticket.updateMany({
        where: {
          transactionId: order.id,
          status: { in: ["PENDING", "ACTIVE"] }
        },
        data: {
          status: "CANCELLED",
        },
      });

      // Restore inventory by decrementing reserved count (don't touch sold count since it wasn't incremented)
      if (order.orderItems) {
        for (const item of order.orderItems) {
          await tx.ticketType.update({
            where: { id: item.ticketTypeId },
            data: {
              // Restore reserved inventory back to available
              reserved: {
                decrement: item.quantity,
              },
              // Note: We don't need to decrement sold count since it was never incremented
            },
          });
        }
      }
    });
  }

  // Admin approval does NOT send emails - that's handled by organizer approval
  // Admin only verifies payment legitimacy, organizer handles customer communication
  console.log(`ℹ️  Admin approval complete for order ${orderId}. Organizer approval needed for ticket delivery.`);

  return updatedOrder;
}
