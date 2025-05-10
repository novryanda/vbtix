import { db } from "~/server/db/client";
import { Prisma, TicketType } from "@prisma/client";

type TicketTypeCreateInput = {
  eventId: string;
  name: string;
  description?: string;
  price: number;
  quota: number;
  perks?: string;
  earlyBirdDeadline?: Date;
  saleStartDate?: Date;
  saleEndDate?: Date;
};

type TicketTypeUpdateInput = Partial<Omit<TicketTypeCreateInput, "eventId">> & {
  remaining?: number;
};

type TicketTypeWithEvent = Prisma.TicketTypeGetPayload<{
  include: {
    event: {
      include: {
        organizer: {
          include: {
            user: true;
          }
        }
      }
    }
  }
}>;

/**
 * Create a new ticket type
 */
export async function createTicketType(data: TicketTypeCreateInput): Promise<TicketType> {
  // Convert price to Decimal
  const priceDecimal = new Prisma.Decimal(data.price);

  return db.ticketType.create({
    data: {
      ...data,
      price: priceDecimal,
      remaining: data.quota, // Initially, remaining = quota
    },
  });
}

/**
 * Get all ticket types with optional filtering
 */
export async function getTicketTypes(params?: {
  eventId?: string;
  limit?: number;
  offset?: number;
}): Promise<TicketType[]> {
  const { eventId, limit = 10, offset = 0 } = params || {};

  // Build the where clause based on params
  const where: Prisma.TicketTypeWhereInput = {};

  if (eventId) {
    where.eventId = eventId;
  }

  return db.ticketType.findMany({
    where,
    orderBy: { price: 'asc' },
    take: limit,
    skip: offset,
  });
}

/**
 * Get ticket type by ID
 */
export async function getTicketTypeById(id: string): Promise<TicketTypeWithEvent | null> {
  return db.ticketType.findUnique({
    where: { id },
    include: {
      event: {
        include: {
          organizer: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Update a ticket type
 */
export async function updateTicketType(id: string, data: TicketTypeUpdateInput): Promise<TicketType> {
  // Convert price to Decimal if provided
  const updateData: any = { ...data };
  if (data.price !== undefined) {
    updateData.price = new Prisma.Decimal(data.price);
  }

  return db.ticketType.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Delete a ticket type
 */
export async function deleteTicketType(id: string): Promise<TicketType> {
  return db.ticketType.delete({
    where: { id },
  });
}

/**
 * Check if a ticket type has available tickets
 */
export async function checkTicketAvailability(id: string): Promise<{ available: boolean; remaining: number }> {
  const ticketType = await db.ticketType.findUnique({
    where: { id },
    select: { remaining: true },
  });

  if (!ticketType) {
    throw new Error("Ticket type not found");
  }

  return {
    available: ticketType.remaining > 0,
    remaining: ticketType.remaining,
  };
}

/**
 * Reserve tickets (decrease remaining count)
 */
export async function reserveTickets(id: string, quantity: number): Promise<TicketType> {
  // First check if there are enough tickets available
  const ticketType = await db.ticketType.findUnique({
    where: { id },
  });

  if (!ticketType) {
    throw new Error("Ticket type not found");
  }

  if (ticketType.remaining < quantity) {
    throw new Error("Not enough tickets available");
  }

  // Update the remaining count
  return db.ticketType.update({
    where: { id },
    data: {
      remaining: {
        decrement: quantity,
      },
    },
  });
}

/**
 * Release tickets (increase remaining count)
 * Used when an order is cancelled
 */
export async function releaseTickets(id: string, quantity: number): Promise<TicketType> {
  // Update the remaining count
  return db.ticketType.update({
    where: { id },
    data: {
      remaining: {
        increment: quantity,
      },
    },
  });
}