import { prisma } from "~/server/db";
import { formatDate } from "~/lib/utils";

/**
 * Get e-tickets for a user
 */
export async function handleGetUserETickets(params: {
  userId: string;
  page?: number | string;
  limit?: number | string;
}) {
  const { userId, page = 1, limit = 10 } = params;

  // Validate parameters
  const validPage = Math.max(1, Number(page));
  const validLimit = Math.min(100, Math.max(1, Number(limit)));
  const skip = (validPage - 1) * validLimit;

  // Get e-tickets with pagination
  const [etickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where: {
        userId,
        transaction: {
          status: "SUCCESS",
        },
        fileUrl: {
          not: null, // Only get tickets that have e-ticket files
        },
      },
      skip,
      take: validLimit,
      orderBy: { createdAt: "desc" },
      include: {
        transaction: {
          select: {
            id: true,
            invoiceNumber: true,
          },
        },
        ticketType: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                venue: true,
                startDate: true,
                endDate: true,
                posterUrl: true,
                organizer: {
                  select: {
                    id: true,
                    orgName: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.ticket.count({
      where: {
        userId,
        transaction: {
          status: "SUCCESS",
        },
        fileUrl: {
          not: null, // Only count tickets that have e-ticket files
        },
      },
    }),
  ]);

  // Process e-tickets for response
  const processedETickets = etickets.map((ticket) => {
    return {
      id: ticket.id,
      qrCodeData: ticket.qrCode, // Use qrCode field from ticket
      fileUrl: ticket.fileUrl,
      generatedAt: ticket.createdAt, // Use createdAt as generatedAt
      formattedGeneratedAt: formatDate(ticket.createdAt),
      delivered: ticket.delivered,
      deliveredAt: ticket.deliveredAt,
      formattedDeliveredAt: ticket.deliveredAt
        ? formatDate(ticket.deliveredAt)
        : null,
      scannedAt: ticket.scannedAt,
      formattedScannedAt: ticket.scannedAt
        ? formatDate(ticket.scannedAt)
        : null,
      order: {
        id: ticket.transaction.id,
        invoiceNumber: ticket.transaction.invoiceNumber,
      },
      ticket: {
        id: ticket.id,
        status: ticket.status,
        checkedIn: ticket.checkedIn,
        ticketType: {
          id: ticket.ticketType.id,
          name: ticket.ticketType.name,
        },
        event: {
          id: ticket.ticketType.event.id,
          title: ticket.ticketType.event.title,
          venue: ticket.ticketType.event.venue,
          startDate: ticket.ticketType.event.startDate,
          endDate: ticket.ticketType.event.endDate,
          formattedStartDate: formatDate(ticket.ticketType.event.startDate),
          formattedEndDate: formatDate(ticket.ticketType.event.endDate),
          posterUrl: ticket.ticketType.event.posterUrl,
          organizer: ticket.ticketType.event.organizer,
        },
      },
    };
  });

  // Return e-tickets with pagination metadata
  return {
    etickets: processedETickets,
    meta: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages: Math.ceil(total / validLimit),
    },
  };
}

/**
 * Get a specific e-ticket by ID
 */
export async function handleGetETicketById(params: {
  eticketId: string;
  userId: string;
}) {
  const { eticketId, userId } = params;

  // Get e-ticket (now a ticket with e-ticket data)
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: eticketId,
      userId,
      transaction: {
        status: "SUCCESS",
      },
      fileUrl: {
        not: null, // Only get tickets that have e-ticket files
      },
    },
    include: {
      transaction: {
        select: {
          id: true,
          invoiceNumber: true,
          amount: true,
          currency: true,
          paymentMethod: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      ticketType: {
        include: {
          event: {
            select: {
              id: true,
              title: true,
              description: true,
              venue: true,
              address: true,
              city: true,
              province: true,
              country: true,
              startDate: true,
              endDate: true,
              posterUrl: true,
              organizer: {
                select: {
                  id: true,
                  orgName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!ticket) {
    throw new Error("E-ticket not found");
  }

  // Process e-ticket for response
  const processedETicket = {
    id: ticket.id,
    qrCodeData: ticket.qrCode, // Use qrCode field from ticket
    fileUrl: ticket.fileUrl,
    generatedAt: ticket.createdAt, // Use createdAt as generatedAt
    formattedGeneratedAt: formatDate(ticket.createdAt),
    delivered: ticket.delivered,
    deliveredAt: ticket.deliveredAt,
    formattedDeliveredAt: ticket.deliveredAt
      ? formatDate(ticket.deliveredAt)
      : null,
    scannedAt: ticket.scannedAt,
    formattedScannedAt: ticket.scannedAt ? formatDate(ticket.scannedAt) : null,
    order: {
      id: ticket.transaction.id,
      invoiceNumber: ticket.transaction.invoiceNumber,
      amount: Number(ticket.transaction.amount),
      currency: ticket.transaction.currency,
      paymentMethod: ticket.transaction.paymentMethod,
      createdAt: ticket.transaction.createdAt,
      formattedCreatedAt: formatDate(ticket.transaction.createdAt),
      user: ticket.transaction.user,
    },
    ticket: {
      id: ticket.id,
      status: ticket.status,
      checkedIn: ticket.checkedIn,
      ticketType: {
        id: ticket.ticketType.id,
        name: ticket.ticketType.name,
        price: Number(ticket.ticketType.price),
        currency: ticket.ticketType.currency,
      },
      event: {
        id: ticket.ticketType.event.id,
        title: ticket.ticketType.event.title,
        description: ticket.ticketType.event.description,
        venue: ticket.ticketType.event.venue,
        address: ticket.ticketType.event.address,
        city: ticket.ticketType.event.city,
        province: ticket.ticketType.event.province,
        country: ticket.ticketType.event.country,
        startDate: ticket.ticketType.event.startDate,
        endDate: ticket.ticketType.event.endDate,
        formattedStartDate: formatDate(ticket.ticketType.event.startDate),
        formattedEndDate: formatDate(ticket.ticketType.event.endDate),
        posterUrl: ticket.ticketType.event.posterUrl,
        organizer: ticket.ticketType.event.organizer,
      },
    },
  };

  return processedETicket;
}

/**
 * Mark e-ticket as delivered
 */
export async function handleMarkETicketDelivered(params: {
  eticketId: string;
}) {
  const { eticketId } = params;

  // Update e-ticket (now a ticket with e-ticket data)
  const updatedTicket = await prisma.ticket.update({
    where: { id: eticketId },
    data: {
      delivered: true,
      deliveredAt: new Date(),
    },
  });

  return updatedTicket;
}
