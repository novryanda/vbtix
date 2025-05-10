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
