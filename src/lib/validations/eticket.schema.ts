import { z } from "zod";

// Schema for validating an e-ticket by QR code
export const validateETicketSchema = z.object({
  qrCodeData: z.string(),
});

// Schema for generating e-tickets for an order
export const generateETicketsSchema = z.object({
  orderId: z.string(),
});

// Schema for updating e-ticket file URL
export const updateETicketFileUrlSchema = z.object({
  fileUrl: z.string().url({ message: "Invalid URL format" }),
});

// Types derived from schemas
export type ValidateETicketInput = z.infer<typeof validateETicketSchema>;
export type GenerateETicketsInput = z.infer<typeof generateETicketsSchema>;
export type UpdateETicketFileUrlInput = z.infer<typeof updateETicketFileUrlSchema>;
