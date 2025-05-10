import { z } from "zod";
import { PaymentStatus } from "@prisma/client";

// Schema for creating a new payment
export const createPaymentSchema = z.object({
  orderId: z.string(),
  gateway: z.string(),
  amount: z.coerce.number().min(0, { message: "Amount cannot be negative" }),
});

// Schema for updating a payment
export const updatePaymentSchema = z.object({
  status: z.nativeEnum(PaymentStatus).optional(),
  paymentId: z.string().optional(),
  hmacSignature: z.string().optional(),
  callbackPayload: z.record(z.any()).optional(),
  receivedAt: z.coerce.date().optional(),
});

// Schema for filtering payments
export const paymentFilterSchema = z.object({
  orderId: z.string().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  gateway: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

// Types derived from schemas
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type PaymentFilterInput = z.infer<typeof paymentFilterSchema>;
