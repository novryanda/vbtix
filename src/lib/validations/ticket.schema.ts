import { z } from "zod";

// Validation schema for Ticket
export const ticketSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format for id" }),
  eventId: z.string().uuid({ message: "Invalid UUID format for eventId" }),
  userId: z.string().uuid({ message: "Invalid UUID format for userId" }),
  price: z.number().min(0, { message: "Price must be a positive number" }),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD"], {
    message: "Invalid ticket status",
  }),
  createdAt: z
    .string()
    .datetime({ message: "Invalid datetime format for createdAt" }),
  updatedAt: z
    .string()
    .datetime({ message: "Invalid datetime format for updatedAt" }),
});

// Export TypeScript type from the schema
export type TicketSchema = z.infer<typeof ticketSchema>;

// Schema for creating a new ticket
export const createTicketSchema = ticketSchema.pick({
  eventId: true,
  userId: true,
  price: true,
  status: true,
});

// Schema for updating an existing ticket
export const updateTicketSchema = ticketSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for deleting a ticket
export const deleteTicketSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format for id" }),
});

// Validation schema for Ticket Type
export const ticketTypeSchema = z.object({
  id: z.string().uuid({ message: "Invalid UUID format for id" }).optional(),
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  price: z.number().min(0, { message: "Price must be a positive number" }),
  quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
  eventId: z.string().uuid({ message: "Invalid UUID format for eventId" }),
  isActive: z.boolean().optional(),
  maxPerOrder: z.number().int().min(1).optional(),
  saleStartDate: z.string().datetime().optional(),
  saleEndDate: z.string().datetime().optional(),
});

// Schema for creating a new ticket type
export const createTicketTypeSchema = ticketTypeSchema.omit({ id: true });

// Schema for updating an existing ticket type
export const updateTicketTypeSchema = ticketTypeSchema
  .partial()
  .omit({ id: true, eventId: true });

// Export TypeScript types for the new schemas
export type CreateTicketSchema = z.infer<typeof createTicketSchema>;
export type UpdateTicketSchema = z.infer<typeof updateTicketSchema>;
export type DeleteTicketSchema = z.infer<typeof deleteTicketSchema>;
export type TicketTypeSchema = z.infer<typeof ticketTypeSchema>;
export type CreateTicketTypeSchema = z.infer<typeof createTicketTypeSchema>;
export type UpdateTicketTypeSchema = z.infer<typeof updateTicketTypeSchema>;
