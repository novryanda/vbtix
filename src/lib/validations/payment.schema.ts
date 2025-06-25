import { z } from 'zod';

// Validation schema for Payment
export const paymentSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format for id' }),
  userId: z.string().uuid({ message: 'Invalid UUID format for userId' }),
  ticketId: z.string().uuid({ message: 'Invalid UUID format for ticketId' }),
  amount: z.number().min(0, { message: 'Amount must be a positive number' }),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED'], { message: 'Invalid payment status' }),
  paymentMethod: z.enum(['MANUAL_PAYMENT', 'QRIS_BY_WONDERS', 'VIRTUAL_ACCOUNT', 'EWALLET', 'QR_CODE', 'RETAIL_OUTLET', 'CREDIT_CARD'], { message: 'Invalid payment method' }),
  createdAt: z.string().datetime({ message: 'Invalid datetime format for createdAt' }),
  updatedAt: z.string().datetime({ message: 'Invalid datetime format for updatedAt' }),
});

// Export TypeScript type from the schema
export type PaymentSchema = z.infer<typeof paymentSchema>;

// Schema for creating a new payment
export const createPaymentSchema = paymentSchema.pick({
  userId: true,
  ticketId: true,
  amount: true,
  paymentMethod: true,
});

// Schema for updating an existing payment
export const updatePaymentSchema = paymentSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for deleting a payment
export const deletePaymentSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format for id' }),
});

// Export TypeScript types for the new schemas
export type CreatePaymentSchema = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentSchema = z.infer<typeof updatePaymentSchema>;
export type DeletePaymentSchema = z.infer<typeof deletePaymentSchema>;
