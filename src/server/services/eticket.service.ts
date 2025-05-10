import { db } from "~/server/db/client";
import { ETicket, Order, OrderStatus, Prisma } from "@prisma/client";
import { generateToken } from "./auth-utils";

type ETicketCreateInput = {
  orderId: string;
  qrCodeData: string;
  fileUrl?: string;
};

type ETicketWithDetails = Prisma.ETicketGetPayload<{
  include: {
    order: {
      include: {
        items: {
          include: {
            ticketType: true;
          }
        };
        event: true;
        user: true;
      }
    }
  }
}>;

/**
 * Generate QR code data for an e-ticket
 */
function generateQRCodeData(orderId: string, orderItemId: string): string {
  // Generate a unique token for the QR code
  const token = generateToken().substring(0, 16);

  // Combine order ID, order item ID, and token to create QR code data
  // Format: orderId:orderItemId:token
  return `${orderId}:${orderItemId}:${token}`;
}

/**
 * Generate e-tickets for an order
 */
export async function generateETickets(orderId: string): Promise<ETicket[]> {
  // Start a transaction to ensure all operations succeed or fail together
  return db.$transaction(async (tx) => {
    // Get the order with items
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            ticketType: true,
          },
        },
        event: true,
        user: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Check if order is paid
    if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.CONFIRMED) {
      throw new Error("Cannot generate e-tickets for unpaid order");
    }

    // Check if e-tickets already exist for this order
    const existingTickets = await tx.eTicket.findMany({
      where: { orderId },
    });

    if (existingTickets.length > 0) {
      throw new Error("E-tickets already generated for this order");
    }

    const eTickets: ETicket[] = [];

    // Generate an e-ticket for each order item
    for (const item of order.items) {
      // For each quantity, generate a separate e-ticket
      for (let i = 0; i < item.quantity; i++) {
        // Generate QR code data
        const qrCodeData = generateQRCodeData(order.id, item.id);

        // Create e-ticket
        const eTicket = await tx.eTicket.create({
          data: {
            orderId: order.id,
            qrCodeData,
            delivered: false,
          },
        });

        eTickets.push(eTicket);
      }
    }

    // Update order status to CONFIRMED if it's not already
    if (order.status !== OrderStatus.CONFIRMED) {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CONFIRMED,
        },
      });
    }

    return eTickets;
  });
}

/**
 * Get e-tickets for an order
 */
export async function getETicketsByOrderId(orderId: string): Promise<ETicket[]> {
  return db.eTicket.findMany({
    where: { orderId },
    orderBy: { generatedAt: 'asc' },
  });
}

/**
 * Get e-ticket by ID
 */
export async function getETicketById(id: string): Promise<ETicketWithDetails | null> {
  return db.eTicket.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          items: {
            include: {
              ticketType: true,
            },
          },
          event: true,
          user: true,
        },
      },
    },
  });
}

/**
 * Mark e-ticket as delivered
 */
export async function markETicketAsDelivered(id: string): Promise<ETicket> {
  return db.eTicket.update({
    where: { id },
    data: {
      delivered: true,
      deliveredAt: new Date(),
    },
  });
}

/**
 * Mark e-ticket as scanned
 */
export async function markETicketAsScanned(id: string): Promise<ETicket> {
  return db.eTicket.update({
    where: { id },
    data: {
      scannedAt: new Date(),
    },
  });
}

/**
 * Validate e-ticket by QR code data
 */
export async function validateETicket(qrCodeData: string): Promise<{
  valid: boolean;
  eTicket?: ETicketWithDetails;
  message?: string;
}> {
  // Find the e-ticket by QR code data
  const eTicket = await db.eTicket.findFirst({
    where: { qrCodeData },
    include: {
      order: {
        include: {
          items: {
            include: {
              ticketType: true,
            },
          },
          event: true,
          user: true,
        },
      },
    },
  });

  if (!eTicket) {
    return {
      valid: false,
      message: "Invalid e-ticket",
    };
  }

  // Check if e-ticket has already been scanned
  if (eTicket.scannedAt) {
    return {
      valid: false,
      eTicket,
      message: "E-ticket has already been scanned",
    };
  }

  // Check if order is confirmed
  if (eTicket.order.status !== OrderStatus.CONFIRMED) {
    return {
      valid: false,
      eTicket,
      message: `Invalid order status: ${eTicket.order.status}`,
    };
  }

  return {
    valid: true,
    eTicket,
  };
}

/**
 * Update e-ticket file URL
 */
export async function updateETicketFileUrl(id: string, fileUrl: string): Promise<ETicket> {
  return db.eTicket.update({
    where: { id },
    data: {
      fileUrl,
    },
  });
}