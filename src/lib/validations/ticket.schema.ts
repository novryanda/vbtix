import { z } from 'zod';

// Validation schema for Ticket
export const ticketSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format for id' }),
  eventId: z.string().uuid({ message: 'Invalid UUID format for eventId' }),
  userId: z.string().uuid({ message: 'Invalid UUID format for userId' }),
  price: z.number().min(0, { message: 'Price must be a positive number' }),
  status: z.enum(['AVAILABLE', 'RESERVED', 'SOLD'], { message: 'Invalid ticket status' }),
  createdAt: z.string().datetime({ message: 'Invalid datetime format for createdAt' }),
  updatedAt: z.string().datetime({ message: 'Invalid datetime format for updatedAt' }),
});

// Export TypeScript type from the schema
export type TicketSchema = z.infer<typeof ticketSchema>;
