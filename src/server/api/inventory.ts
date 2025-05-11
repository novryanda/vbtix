import { prisma } from "~/server/db";
import { organizerService } from "~/server/services/organizer.service";
import { eventService } from "~/server/services/event.service";

/**
 * Get inventory status for an event
 */
export async function handleGetEventInventory(params: {
  userId: string;
  eventId: string;
}) {
  const { userId, eventId } = params;

  if (!eventId) throw new Error("Event ID is required");

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Check if event exists and belongs to the organizer
  const event = await eventService.findById(eventId);
  if (!event) throw new Error("Event not found");

  if (event.organizerId !== organizer.id) {
    throw new Error("Event does not belong to this organizer");
  }

  // Get all ticket types for the event
  const ticketTypes = await prisma.ticketType.findMany({
    where: { eventId },
    orderBy: { price: "asc" },
  });

  // Get sold tickets count for each ticket type
  const inventoryData = await Promise.all(
    ticketTypes.map(async (ticketType) => {
      const soldCount = await prisma.ticket.count({
        where: {
          ticketTypeId: ticketType.id,
          status: { not: "CANCELLED" },
        },
      });

      const availableCount = ticketType.quantity - soldCount;

      return {
        ...ticketType,
        sold: soldCount,
        available: availableCount,
        percentageSold:
          ticketType.quantity > 0
            ? Math.round((soldCount / ticketType.quantity) * 100)
            : 0,
      };
    }),
  );

  return {
    eventId,
    ticketTypes: inventoryData,
  };
}

/**
 * Update ticket type quantity
 */
export async function handleUpdateTicketQuantity(params: {
  userId: string;
  ticketTypeId: string;
  quantity: number;
}) {
  const { userId, ticketTypeId, quantity } = params;

  if (!ticketTypeId) throw new Error("Ticket Type ID is required");
  if (quantity < 0) throw new Error("Quantity cannot be negative");

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Check if ticket type exists
  const ticketType = await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
    include: { event: true },
  });

  if (!ticketType) throw new Error("Ticket type not found");

  // Check if the event belongs to the organizer
  if (ticketType.event.organizerId !== organizer.id) {
    throw new Error("Ticket type does not belong to this organizer's event");
  }

  // Get current sold tickets count
  const soldCount = await prisma.ticket.count({
    where: {
      ticketTypeId,
      status: { not: "CANCELLED" },
    },
  });

  // Ensure new quantity is not less than sold tickets
  if (quantity < soldCount) {
    throw new Error(
      `Cannot reduce quantity below sold tickets count (${soldCount})`,
    );
  }

  // Update ticket type quantity
  const updatedTicketType = await prisma.ticketType.update({
    where: { id: ticketTypeId },
    data: { quantity },
  });

  return {
    ...updatedTicketType,
    sold: soldCount,
    available: updatedTicketType.quantity - soldCount,
  };
}

/**
 * Get inventory summary for all events of an organizer
 */
export async function handleGetOrganizerInventorySummary(params: {
  userId: string;
}) {
  const { userId } = params;

  // Check if user is an organizer
  const organizer = await organizerService.findByUserId(userId);
  if (!organizer) {
    throw new Error("User is not an organizer");
  }

  // Get all events for the organizer
  const events = await prisma.event.findMany({
    where: { organizerId: organizer.id },
    include: {
      ticketTypes: true,
    },
    orderBy: { startDate: "asc" },
  });

  // Calculate inventory summary for each event
  const inventorySummary = await Promise.all(
    events.map(async (event) => {
      // Calculate total tickets and sold tickets
      let totalTickets = 0;
      let totalSold = 0;

      for (const ticketType of event.ticketTypes) {
        totalTickets += ticketType.quantity;

        const soldCount = await prisma.ticket.count({
          where: {
            ticketTypeId: ticketType.id,
            status: { not: "CANCELLED" },
          },
        });

        totalSold += soldCount;
      }

      return {
        eventId: event.id,
        title: event.title,
        startDate: event.startDate,
        totalTickets,
        totalSold,
        available: totalTickets - totalSold,
        percentageSold:
          totalTickets > 0 ? Math.round((totalSold / totalTickets) * 100) : 0,
      };
    }),
  );

  return {
    organizerId: organizer.id,
    events: inventorySummary,
  };
}
