import { db } from "~/server/db/client";
import { Event, EventStatus, Prisma } from "@prisma/client";
import { createSlug } from "~/lib/utils";

type EventCreateInput = {
  title: string;
  description?: string;
  organizerId: string;
  venue: string;
  address?: string;
  city?: string;
  category?: string;
  startDateTime: Date;
  endDateTime?: Date;
  posterUrl?: string;
  bannerUrl?: string;
};

type EventUpdateInput = Partial<EventCreateInput> & {
  status?: EventStatus;
};

type EventWithTickets = Prisma.EventGetPayload<{
  include: {
    ticketTypes: true;
    organizer: {
      include: {
        user: true;
      }
    }
  }
}>;

type EventWithOrganizer = Prisma.EventGetPayload<{
  include: {
    organizer: {
      include: {
        user: true;
      }
    }
  }
}>;

/**
 * Create a new event
 */
export async function createEvent(data: EventCreateInput): Promise<Event> {
  const { title, ...eventData } = data;

  // Generate a slug from the title
  const slug = createSlug(title);

  // Check if slug already exists
  const existingEvent = await db.event.findUnique({
    where: { slug },
  });

  // If slug exists, append a random string
  const finalSlug = existingEvent
    ? `${slug}-${Math.random().toString(36).substring(2, 7)}`
    : slug;

  return db.event.create({
    data: {
      ...eventData,
      title,
      slug: finalSlug,
      status: EventStatus.DRAFT,
    },
  });
}

/**
 * Get all events with optional filtering
 */
export async function getEvents(params?: {
  status?: EventStatus;
  organizerId?: string;
  category?: string;
  city?: string;
  search?: string;
  upcoming?: boolean;
  limit?: number;
  offset?: number;
}): Promise<EventWithOrganizer[]> {
  const {
    status,
    organizerId,
    category,
    city,
    search,
    upcoming = false,
    limit = 10,
    offset = 0
  } = params || {};

  // Build the where clause based on params
  const where: Prisma.EventWhereInput = {};

  if (status) {
    where.status = status;
  } else {
    // By default, only return published events unless status is explicitly provided
    where.status = EventStatus.PUBLISHED;
  }

  if (organizerId) {
    where.organizerId = organizerId;
  }

  if (category) {
    where.category = category;
  }

  if (city) {
    where.city = city;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { venue: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (upcoming) {
    where.startDateTime = { gte: new Date() };
  }

  return db.event.findMany({
    where,
    include: {
      organizer: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { startDateTime: 'asc' },
    take: limit,
    skip: offset,
  });
}

/**
 * Get event by ID
 */
export async function getEventById(id: string): Promise<EventWithTickets | null> {
  return db.event.findUnique({
    where: { id },
    include: {
      ticketTypes: true,
      organizer: {
        include: {
          user: true,
        },
      },
    },
  });
}

/**
 * Get event by slug
 */
export async function getEventBySlug(slug: string): Promise<EventWithTickets | null> {
  return db.event.findUnique({
    where: { slug },
    include: {
      ticketTypes: true,
      organizer: {
        include: {
          user: true,
        },
      },
    },
  });
}

/**
 * Update an event
 */
export async function updateEvent(id: string, data: EventUpdateInput): Promise<Event> {
  // If title is being updated, update the slug as well
  if (data.title) {
    const slug = createSlug(data.title);

    // Check if slug already exists and is not the current event
    const existingEvent = await db.event.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });

    // If slug exists, append a random string
    const finalSlug = existingEvent
      ? `${slug}-${Math.random().toString(36).substring(2, 7)}`
      : slug;

    return db.event.update({
      where: { id },
      data: {
        ...data,
        slug: finalSlug,
      },
    });
  }

  return db.event.update({
    where: { id },
    data,
  });
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string): Promise<Event> {
  return db.event.delete({
    where: { id },
  });
}

/**
 * Submit an event for review
 */
export async function submitEventForReview(id: string): Promise<Event> {
  // Update event status to PENDING_REVIEW
  const event = await db.event.update({
    where: { id },
    data: {
      status: EventStatus.PENDING_REVIEW,
    },
  });

  // Create an approval record
  await db.approval.create({
    data: {
      entityType: 'Event',
      entityId: id,
      status: 'PENDING',
    },
  });

  return event;
}

/**
 * Approve an event
 */
export async function approveEvent(id: string, reviewerId: string, notes?: string): Promise<Event> {
  // Update the approval record
  await db.approval.updateMany({
    where: {
      entityType: 'Event',
      entityId: id,
      status: 'PENDING',
    },
    data: {
      status: 'APPROVED',
      reviewerId,
      notes,
      reviewedAt: new Date(),
    },
  });

  // Update the event status
  return db.event.update({
    where: { id },
    data: {
      status: EventStatus.PUBLISHED,
    },
  });
}

/**
 * Reject an event
 */
export async function rejectEvent(id: string, reviewerId: string, notes?: string): Promise<Event> {
  // Update the approval record
  await db.approval.updateMany({
    where: {
      entityType: 'Event',
      entityId: id,
      status: 'PENDING',
    },
    data: {
      status: 'REJECTED',
      reviewerId,
      notes,
      reviewedAt: new Date(),
    },
  });

  // Update the event status
  return db.event.update({
    where: { id },
    data: {
      status: EventStatus.REJECTED,
    },
  });
}

/**
 * Get event categories
 */
export async function getEventCategories(): Promise<string[]> {
  const events = await db.event.findMany({
    where: {
      category: { not: null },
    },
    select: {
      category: true,
    },
    distinct: ['category'],
  });

  return events
    .map(event => event.category)
    .filter((category): category is string => category !== null);
}

/**
 * Get event cities
 */
export async function getEventCities(): Promise<string[]> {
  const events = await db.event.findMany({
    where: {
      city: { not: null },
    },
    select: {
      city: true,
    },
    distinct: ['city'],
  });

  return events
    .map(event => event.city)
    .filter((city): city is string => city !== null);
}

/**
 * Set event featured status
 */
export async function setEventFeatured(id: string, featured: boolean): Promise<Event> {
  return db.event.update({
    where: { id },
    data: {
      featured,
    },
  });
}

/**
 * Get event statistics
 */
export async function getEventStatistics(id: string): Promise<{
  totalTickets: number;
  soldTickets: number;
  revenue: number;
  viewCount: number;
}> {
  // Get the event with ticket types
  const event = await db.event.findUnique({
    where: { id },
    include: {
      ticketTypes: true,
    },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  // Calculate total tickets and sold tickets
  const totalTickets = event.ticketTypes.reduce((sum, type) => sum + type.quantity, 0);
  const soldTickets = event.ticketTypes.reduce((sum, type) => sum + type.sold, 0);

  // Calculate revenue (price * sold for each ticket type)
  const revenue = event.ticketTypes.reduce(
    (sum, type) => sum + (Number(type.price) * type.sold),
    0
  );

  // In a real application, you would track page views in a separate table
  // For now, we'll return a placeholder value
  const viewCount = 0;

  return {
    totalTickets,
    soldTickets,
    revenue,
    viewCount,
  };
}