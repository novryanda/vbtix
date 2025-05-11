import { z } from 'zod';

// Validation schema for Event
export const eventSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format for id' }),
  name: z.string().min(1, { message: 'Event name cannot be empty' }),
  description: z.string().optional(),
  date: z.string().datetime({ message: 'Invalid datetime format for date' }),
  location: z.string().min(1, { message: 'Location cannot be empty' }),
  organizerId: z.string().uuid({ message: 'Invalid UUID format for organizerId' }),
  createdAt: z.string().datetime({ message: 'Invalid datetime format for createdAt' }),
  updatedAt: z.string().datetime({ message: 'Invalid datetime format for updatedAt' }),
});

// Export TypeScript type from the schema
export type EventSchema = z.infer<typeof eventSchema>;

// Schema for creating a new event
export const createEventSchema = eventSchema.pick({
  name: true,
  description: true,
  date: true,
  location: true,
  organizerId: true,
});

// Schema for updating an existing event
export const updateEventSchema = eventSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for deleting an event
export const deleteEventSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format for id' }),
});

// Export TypeScript types for the new schemas
export type CreateEventSchema = z.infer<typeof createEventSchema>;
export type UpdateEventSchema = z.infer<typeof updateEventSchema>;
export type DeleteEventSchema = z.infer<typeof deleteEventSchema>;
