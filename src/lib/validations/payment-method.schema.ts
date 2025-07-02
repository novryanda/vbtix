import { z } from "zod";

/**
 * Schema for PaymentMethod validation
 */
export const paymentMethodSchema = z.object({
  id: z.string().min(1, { message: "Payment method ID cannot be empty" }),
  code: z
    .string()
    .min(1, { message: "Payment method code cannot be empty" })
    .max(50, { message: "Payment method code cannot exceed 50 characters" })
    .regex(/^[A-Z_]+$/, { message: "Payment method code must contain only uppercase letters and underscores" }),
  name: z
    .string()
    .min(1, { message: "Payment method name cannot be empty" })
    .max(100, { message: "Payment method name cannot exceed 100 characters" }),
  description: z
    .string()
    .max(500, { message: "Description cannot exceed 500 characters" })
    .optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime({ message: "Invalid datetime format for createdAt" }),
  updatedAt: z.string().datetime({ message: "Invalid datetime format for updatedAt" }),
});

/**
 * Export TypeScript type from the schema
 */
export type PaymentMethodSchema = z.infer<typeof paymentMethodSchema>;

/**
 * Schema for creating a new payment method
 */
export const createPaymentMethodSchema = paymentMethodSchema.pick({
  code: true,
  name: true,
  description: true,
  isActive: true,
});

/**
 * Schema for updating an existing payment method
 */
export const updatePaymentMethodSchema = paymentMethodSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Schema for deleting a payment method
 */
export const deletePaymentMethodSchema = z.object({
  id: z.string().min(1, { message: "Payment method ID cannot be empty" }),
});

/**
 * Schema for TicketTypePaymentMethod junction
 */
export const ticketTypePaymentMethodSchema = z.object({
  id: z.string().min(1, { message: "ID cannot be empty" }),
  ticketTypeId: z.string().min(1, { message: "Ticket type ID cannot be empty" }),
  paymentMethodId: z.string().min(1, { message: "Payment method ID cannot be empty" }),
  createdAt: z.string().datetime({ message: "Invalid datetime format for createdAt" }),
});

/**
 * Export TypeScript type from the schema
 */
export type TicketTypePaymentMethodSchema = z.infer<typeof ticketTypePaymentMethodSchema>;

/**
 * Schema for creating ticket type payment method associations
 */
export const createTicketTypePaymentMethodSchema = ticketTypePaymentMethodSchema.pick({
  ticketTypeId: true,
  paymentMethodId: true,
});

/**
 * Schema for bulk updating ticket type payment methods
 */
export const updateTicketTypePaymentMethodsSchema = z.object({
  ticketTypeId: z.string().cuid({ message: "Invalid ticket type ID format" }),
  paymentMethodIds: z
    .array(z.string().cuid({ message: "Invalid payment method ID format" }))
    .min(1, { message: "At least one payment method must be selected" }),
});

/**
 * Available payment method codes enum for validation
 */
export const PAYMENT_METHOD_CODES = [
  "MANUAL_PAYMENT",
  "QRIS_BY_WONDERS",
  "VIRTUAL_ACCOUNT",
  "EWALLET",
  "QR_CODE",
  "RETAIL_OUTLET",
  "CREDIT_CARD",
] as const;

/**
 * Schema for validating payment method codes
 */
export const paymentMethodCodeSchema = z.enum(PAYMENT_METHOD_CODES, {
  errorMap: () => ({ message: "Invalid payment method code" }),
});

export type PaymentMethodCode = z.infer<typeof paymentMethodCodeSchema>;
