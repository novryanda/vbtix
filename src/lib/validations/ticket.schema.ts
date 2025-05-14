import { z } from 'zod';

/**
 * Enum for ticket status matching the Prisma schema
 */
export const TicketStatus = z.enum([
  'ACTIVE',
  'USED',
  'CANCELLED',
  'EXPIRED',
  'REFUNDED',
]);

/**
 * Validation schema for Ticket
 */
export const ticketSchema = z.object({
  id: z.string(),
  ticketTypeId: z.string(),
  transactionId: z.string(),
  userId: z.string(),
  qrCode: z.string().min(1, { message: 'QR Code cannot be empty' }),
  status: TicketStatus,
  checkedIn: z.boolean(),
  checkInTime: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Export TypeScript type from the schema
 */
export type TicketSchema = z.infer<typeof ticketSchema>;

/**
 * Schema for creating a new ticket
 */
export const createTicketSchema = z.object({
  ticketTypeId: z.string(),
  transactionId: z.string(),
  userId: z.string(),
  qrCode: z.string().min(1, { message: 'QR Code cannot be empty' }),
  status: TicketStatus.optional().default('ACTIVE'),
  checkedIn: z.boolean().optional().default(false),
});

/**
 * Schema for updating an existing ticket
 */
export const updateTicketSchema = z.object({
  status: TicketStatus.optional(),
  checkedIn: z.boolean().optional(),
  checkInTime: z.date().nullable().optional(),
});

/**
 * Schema for validating ticket check-in
 */
export const checkInTicketSchema = z.object({
  ticketId: z.string(),
  checkedIn: z.boolean().default(true),
  checkInTime: z.date().optional().default(() => new Date()),
});

/**
 * Schema for validating ticket status update
 */
export const updateTicketStatusSchema = z.object({
  ticketId: z.string(),
  status: TicketStatus,
});

/**
 * Schema for validating ticket deletion
 */
export const deleteTicketSchema = z.object({
  id: z.string(),
});

/**
 * Validation schema for TicketType
 */
export const ticketTypeSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string().min(1, { message: 'Name cannot be empty' }),
  description: z.string().nullable().optional(),
  price: z.number().or(z.string().transform(val => parseFloat(val))).refine(val => val >= 0, {
    message: 'Price must be a positive number',
  }),
  currency: z.string().default('IDR'),
  quantity: z.number().int().positive({ message: 'Quantity must be a positive integer' }),
  sold: z.number().int().default(0),
  maxPerPurchase: z.number().int().positive().default(10),
  isVisible: z.boolean().default(true),
  allowTransfer: z.boolean().default(false),
  ticketFeatures: z.string().nullable().optional(),
  perks: z.string().nullable().optional(),
  earlyBirdDeadline: z.date().nullable().optional(),
  saleStartDate: z.date().nullable().optional(),
  saleEndDate: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Export TypeScript type from the schema
 */
export type TicketTypeSchema = z.infer<typeof ticketTypeSchema>;

/**
 * Schema for creating a new ticket type
 */
export const createTicketTypeSchema = z.object({
  name: z.string().min(1, { message: 'Name cannot be empty' }),
  description: z.string().optional(),
  price: z.number().or(z.string().transform(val => parseFloat(val))).refine(val => val >= 0, {
    message: 'Price must be a positive number',
  }),
  currency: z.string().optional().default('IDR'),
  quantity: z.number().int().positive({ message: 'Quantity must be a positive integer' }),
  maxPerPurchase: z.number().int().positive().optional().default(10),
  isVisible: z.boolean().optional().default(true),
  allowTransfer: z.boolean().optional().default(false),
  ticketFeatures: z.string().optional(),
  perks: z.string().optional(),
  earlyBirdDeadline: z.string().datetime().optional(),
  saleStartDate: z.string().datetime().optional(),
  saleEndDate: z.string().datetime().optional(),
});

/**
 * Schema for updating an existing ticket type
 */
export const updateTicketTypeSchema = z.object({
  name: z.string().min(1, { message: 'Name cannot be empty' }).optional(),
  description: z.string().optional(),
  price: z.number().or(z.string().transform(val => parseFloat(val))).refine(val => val >= 0, {
    message: 'Price must be a positive number',
  }).optional(),
  currency: z.string().optional(),
  quantity: z.number().int().positive({ message: 'Quantity must be a positive integer' }).optional(),
  maxPerPurchase: z.number().int().positive().optional(),
  isVisible: z.boolean().optional(),
  allowTransfer: z.boolean().optional(),
  ticketFeatures: z.string().optional(),
  perks: z.string().optional(),
  earlyBirdDeadline: z.string().datetime().optional(),
  saleStartDate: z.string().datetime().optional(),
  saleEndDate: z.string().datetime().optional(),
});

/**
 * Schema for deleting a ticket type
 */
export const deleteTicketTypeSchema = z.object({
  id: z.string(),
});
