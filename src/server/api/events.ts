import { EventStatus, UserRole } from "@prisma/client";
import { auth } from "~/server/auth";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  submitEventForReview,
  approveEvent,
  rejectEvent,
  setEventFeatured,
} from "~/server/services/event.service";
import {
  createEventSchema,
  updateEventSchema,
  submitEventSchema,
  reviewEventSchema,
  eventFilterSchema,
} from "~/lib/validations/event.schema";
import { ApiResponse } from "~/lib/types";
import { EventWithTickets } from "~/lib/types";

/**
 * Handle getting all events with optional filtering
 */
export async function handleGetEvents(params: unknown): Promise<ApiResponse<EventWithTickets[]>> {
  try {
    // Validate filter parameters
    const validationResult = eventFilterSchema.safeParse(params);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid filter parameters",
        errors: validationResult.error.errors.map((err) => ({
          message: err.message,
        })),
      };
    }

    // Get events from database
    const events = await getEvents(validationResult.data);

    return {
      success: true,
      data: events as unknown as EventWithTickets[],
    };
  } catch (error) {
    console.error("Error in handleGetEvents:", error);
    return {
      success: false,
      error: "Failed to get events",
    };
  }
}

/**
 * Handle getting a single event by ID
 */
export async function handleGetEventById(id: string): Promise<ApiResponse<EventWithTickets>> {
  try {
    // Get event from database
    const event = await getEventById(id);

    if (!event) {
      return {
        success: false,
        error: "Event not found",
      };
    }

    return {
      success: true,
      data: event as unknown as EventWithTickets,
    };
  } catch (error) {
    console.error(`Error in handleGetEventById for ID ${id}:`, error);
    return {
      success: false,
      error: "Failed to get event",
    };
  }
}

/**
 * Handle creating a new event
 */
export async function handleCreateEvent(data: unknown): Promise<ApiResponse<EventWithTickets>> {
  try {
    // Validate input data
    const validationResult = createEventSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid event data",
        errors: validationResult.error.errors.map((err) => ({
          message: err.message,
        })),
      };
    }

    // Get current user
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // If user is not an admin, check if they're creating an event for their own organizer
    if (session.user.role !== UserRole.ADMIN) {
      // TODO: Check if user is the organizer
    }

    // Create event in database
    const event = await createEvent(validationResult.data);

    return {
      success: true,
      data: event as unknown as EventWithTickets,
    };
  } catch (error) {
    console.error("Error in handleCreateEvent:", error);
    return {
      success: false,
      error: "Failed to create event",
    };
  }
}

/**
 * Handle updating an event
 */
export async function handleUpdateEvent(id: string, data: unknown): Promise<ApiResponse<EventWithTickets>> {
  try {
    // Validate input data
    const validationResult = updateEventSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid event data",
        errors: validationResult.error.errors.map((err) => ({
          message: err.message,
        })),
      };
    }

    // Get current user
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get event from database
    const event = await getEventById(id);
    if (!event) {
      return {
        success: false,
        error: "Event not found",
      };
    }

    // Check if user is authorized to update this event
    if (session.user.role !== UserRole.ADMIN && event.organizerId !== session.user.id) {
      return {
        success: false,
        error: "Forbidden",
      };
    }

    // Update event in database
    const updatedEvent = await updateEvent(id, validationResult.data);

    return {
      success: true,
      data: updatedEvent as unknown as EventWithTickets,
    };
  } catch (error) {
    console.error(`Error in handleUpdateEvent for ID ${id}:`, error);
    return {
      success: false,
      error: "Failed to update event",
    };
  }
}

/**
 * Handle deleting an event
 */
export async function handleDeleteEvent(id: string): Promise<ApiResponse<{ id: string }>> {
  try {
    // Get current user
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get event from database
    const event = await getEventById(id);
    if (!event) {
      return {
        success: false,
        error: "Event not found",
      };
    }

    // Check if user is authorized to delete this event
    if (session.user.role !== UserRole.ADMIN && event.organizerId !== session.user.id) {
      return {
        success: false,
        error: "Forbidden",
      };
    }

    // Delete event from database
    await deleteEvent(id);

    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    console.error(`Error in handleDeleteEvent for ID ${id}:`, error);
    return {
      success: false,
      error: "Failed to delete event",
    };
  }
}

/**
 * Handle submitting an event for review
 */
export async function handleSubmitEvent(data: unknown): Promise<ApiResponse<EventWithTickets>> {
  try {
    // Validate input data
    const validationResult = submitEventSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid input data",
        errors: validationResult.error.errors.map((err) => ({
          message: err.message,
        })),
      };
    }

    // Get current user
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const { id } = validationResult.data;

    // Get event from database
    const event = await getEventById(id);
    if (!event) {
      return {
        success: false,
        error: "Event not found",
      };
    }

    // Check if user is authorized to submit this event
    if (session.user.role !== UserRole.ADMIN && event.organizerId !== session.user.id) {
      return {
        success: false,
        error: "Forbidden",
      };
    }

    // Submit event for review
    const updatedEvent = await submitEventForReview(id);

    return {
      success: true,
      data: updatedEvent as unknown as EventWithTickets,
      message: "Event submitted for review",
    };
  } catch (error) {
    console.error("Error in handleSubmitEvent:", error);
    return {
      success: false,
      error: "Failed to submit event for review",
    };
  }
}

/**
 * Handle reviewing an event (approve/reject)
 */
export async function handleReviewEvent(data: unknown): Promise<ApiResponse<EventWithTickets>> {
  try {
    // Validate input data
    const validationResult = reviewEventSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid input data",
        errors: validationResult.error.errors.map((err) => ({
          message: err.message,
        })),
      };
    }

    // Get current user
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Only admins can review events
    if (session.user.role !== UserRole.ADMIN) {
      return {
        success: false,
        error: "Forbidden",
      };
    }

    const { id, status, notes } = validationResult.data;

    // Get event from database
    const event = await getEventById(id);
    if (!event) {
      return {
        success: false,
        error: "Event not found",
      };
    }

    // Check if event is in PENDING_REVIEW status
    if (event.status !== EventStatus.PENDING_REVIEW) {
      return {
        success: false,
        error: "Event is not pending review",
      };
    }

    let updatedEvent;
    if (status === "APPROVED") {
      updatedEvent = await approveEvent(id, session.user.id, notes);
    } else {
      updatedEvent = await rejectEvent(id, session.user.id, notes);
    }

    return {
      success: true,
      data: updatedEvent as unknown as EventWithTickets,
      message: `Event ${status === "APPROVED" ? "approved" : "rejected"}`,
    };
  } catch (error) {
    console.error("Error in handleReviewEvent:", error);
    return {
      success: false,
      error: "Failed to review event",
    };
  }
}

/**
 * Handle setting an event as featured
 */
export async function handleSetEventFeatured(id: string, featured: boolean): Promise<ApiResponse<EventWithTickets>> {
  try {
    // Get current user
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Only admins can set events as featured
    if (session.user.role !== UserRole.ADMIN) {
      return {
        success: false,
        error: "Forbidden",
      };
    }

    // Get event from database
    const event = await getEventById(id);
    if (!event) {
      return {
        success: false,
        error: "Event not found",
      };
    }

    // Set event as featured
    const updatedEvent = await setEventFeatured(id, featured);

    return {
      success: true,
      data: updatedEvent as unknown as EventWithTickets,
      message: `Event ${featured ? "featured" : "unfeatured"}`,
    };
  } catch (error) {
    console.error(`Error in handleSetEventFeatured for ID ${id}:`, error);
    return {
      success: false,
      error: "Failed to set event featured status",
    };
  }
}

/**
 * Handle getting event categories
 */
export async function handleGetEventCategories(): Promise<ApiResponse<string[]>> {
  try {
    // This would typically come from a database, but for now we'll return a static list
    const categories = [
      "Music",
      "Sports",
      "Arts",
      "Food",
      "Technology",
      "Business",
      "Education",
      "Health",
      "Lifestyle",
      "Other",
    ];

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error("Error in handleGetEventCategories:", error);
    return {
      success: false,
      error: "Failed to get event categories",
    };
  }
}

/**
 * Handle getting event statistics
 */
export async function handleGetEventStatistics(id: string): Promise<ApiResponse<{
  totalTickets: number;
  soldTickets: number;
  revenue: number;
  viewCount: number;
}>> {
  try {
    // Get event statistics from service
    const statistics = await getEventStatistics(id);

    return {
      success: true,
      data: statistics,
    };
  } catch (error) {
    console.error(`Error in handleGetEventStatistics for ID ${id}:`, error);

    if (error instanceof Error && error.message === 'Event not found') {
      return {
        success: false,
        error: "Event not found",
      };
    }

    return {
      success: false,
      error: "Failed to get event statistics",
    };
  }
}