import { z } from "zod";

// Schema for creating a new ticket type
export const createTicketTypeSchema = z.object({
  eventId: z.string(),
  name: z.string().min(2, { message: "Nama tiket harus minimal 2 karakter" }).max(50),
  description: z.string().max(500).optional(),
  price: z.coerce.number().min(0, { message: "Harga tidak boleh negatif" }),
  quota: z.coerce.number().min(1, { message: "Kuota minimal 1" }),
  perks: z.string().max(500).optional(),
  earlyBirdDeadline: z.coerce.date().optional(),
  saleStartDate: z.coerce.date().optional(),
  saleEndDate: z.coerce.date().optional(),
});

// Schema for updating a ticket type
export const updateTicketTypeSchema = createTicketTypeSchema.omit({ eventId: true }).partial().extend({
  remaining: z.coerce.number().min(0).optional(),
});

// Schema for validating a ticket
export const validateTicketSchema = z.object({
  ticketId: z.string(),
  eventId: z.string().optional(),
});

// Schema for filtering tickets
export const ticketFilterSchema = z.object({
  eventId: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

// Types derived from schemas
export type CreateTicketTypeInput = z.infer<typeof createTicketTypeSchema>;
export type UpdateTicketTypeInput = z.infer<typeof updateTicketTypeSchema>;
export type ValidateTicketInput = z.infer<typeof validateTicketSchema>;
export type TicketFilterInput = z.infer<typeof ticketFilterSchema>;