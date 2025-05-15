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
    prisma.eTicket.findMany({
      where: {
        order: {
          userId,
          status: "SUCCESS",
        },
      },
      skip,
      take: validLimit,
      orderBy: { generatedAt: "desc" },
      include: {
        order: {
          select: {
            id: true,
            invoiceNumber: true,
            tickets: {
              include: {
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
            },
          },
        },
      },
    }),
    prisma.eTicket.count({
      where: {
        order: {
          userId,
          status: "SUCCESS",
        },
      },
    }),
  ]);

  // Process e-tickets for response
  const processedETickets = etickets.map((eticket) => {
    // Get the first ticket for this e-ticket (assuming one e-ticket per ticket)
    const ticket = eticket.order.tickets[0];

    return {
      id: eticket.id,
      qrCodeData: eticket.qrCodeData,
      fileUrl: eticket.fileUrl,
      generatedAt: eticket.generatedAt,
      formattedGeneratedAt: formatDate(eticket.generatedAt),
      delivered: eticket.delivered,
      deliveredAt: eticket.deliveredAt,
      formattedDeliveredAt: eticket.deliveredAt
        ? formatDate(eticket.deliveredAt)
        : null,
      scannedAt: eticket.scannedAt,
      formattedScannedAt: eticket.scannedAt
        ? formatDate(eticket.scannedAt)
        : null,
      order: {
        id: eticket.order.id,
        invoiceNumber: eticket.order.invoiceNumber,
      },
      ticket: ticket
        ? {
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
          }
        : null,
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

  // Get e-ticket
  const eticket = await prisma.eTicket.findFirst({
    where: {
      id: eticketId,
      order: {
        userId,
        status: "SUCCESS",
      },
    },
    include: {
      order: {
        select: {
          id: true,
          invoiceNumber: true,
          amount: true,
          currency: true,
          paymentMethod: true,
          createdAt: true,
          tickets: {
            include: {
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
          },
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
    },
  });

  if (!eticket) {
    throw new Error("E-ticket not found");
  }

  // Get the first ticket for this e-ticket (assuming one e-ticket per ticket)
  const ticket = eticket.order.tickets[0];

  // Process e-ticket for response
  const processedETicket = {
    id: eticket.id,
    qrCodeData: eticket.qrCodeData,
    fileUrl: eticket.fileUrl,
    generatedAt: eticket.generatedAt,
    formattedGeneratedAt: formatDate(eticket.generatedAt),
    delivered: eticket.delivered,
    deliveredAt: eticket.deliveredAt,
    formattedDeliveredAt: eticket.deliveredAt
      ? formatDate(eticket.deliveredAt)
      : null,
    scannedAt: eticket.scannedAt,
    formattedScannedAt: eticket.scannedAt
      ? formatDate(eticket.scannedAt)
      : null,
    order: {
      id: eticket.order.id,
      invoiceNumber: eticket.order.invoiceNumber,
      amount: Number(eticket.order.amount),
      currency: eticket.order.currency,
      paymentMethod: eticket.order.paymentMethod,
      createdAt: eticket.order.createdAt,
      formattedCreatedAt: formatDate(eticket.order.createdAt),
      user: eticket.order.user,
    },
    ticket: ticket
      ? {
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
        }
      : null,
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

  // Update e-ticket
  const updatedETicket = await prisma.eTicket.update({
    where: { id: eticketId },
    data: {
      delivered: true,
      deliveredAt: new Date(),
    },
  });

  return updatedETicket;
}
