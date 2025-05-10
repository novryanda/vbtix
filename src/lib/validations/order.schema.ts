import { z } from 'zod';

// Validation schema for Order
export const orderSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format for id' }),
  userId: z.string().uuid({ message: 'Invalid UUID format for userId' }),
  ticketId: z.string().uuid({ message: 'Invalid UUID format for ticketId' }),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED'], { message: 'Invalid order status' }),
  totalAmount: z.number().min(0, { message: 'Total amount must be a positive number' }),
  createdAt: z.string().datetime({ message: 'Invalid datetime format for createdAt' }),
  updatedAt: z.string().datetime({ message: 'Invalid datetime format for updatedAt' }),
});

// Export TypeScript type from the schema
export type OrderSchema = z.infer<typeof orderSchema>;
