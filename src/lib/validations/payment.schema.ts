import { z } from 'zod';

// Validation schema for Payment
export const paymentSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format for id' }),
  userId: z.string().uuid({ message: 'Invalid UUID format for userId' }),
  ticketId: z.string().uuid({ message: 'Invalid UUID format for ticketId' }),
  amount: z.number().min(0, { message: 'Amount must be a positive number' }),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED'], { message: 'Invalid payment status' }),
  paymentMethod: z.enum(['CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER'], { message: 'Invalid payment method' }),
  createdAt: z.string().datetime({ message: 'Invalid datetime format for createdAt' }),
  updatedAt: z.string().datetime({ message: 'Invalid datetime format for updatedAt' }),
});

// Export TypeScript type from the schema
export type PaymentSchema = z.infer<typeof paymentSchema>;
