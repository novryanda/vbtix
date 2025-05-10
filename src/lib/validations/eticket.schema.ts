import { z } from 'zod';

// Validation schema for eTicket
export const eTicketSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format for id' }),
  ticketId: z.string().uuid({ message: 'Invalid UUID format for ticketId' }),
  userId: z.string().uuid({ message: 'Invalid UUID format for userId' }),
  qrCode: z.string().min(1, { message: 'QR Code cannot be empty' }),
  status: z.enum(['ACTIVE', 'USED', 'EXPIRED'], { message: 'Invalid eTicket status' }),
  issuedAt: z.string().datetime({ message: 'Invalid datetime format for issuedAt' }),
  expiresAt: z.string().datetime({ message: 'Invalid datetime format for expiresAt' }).optional(),
});

// Export TypeScript type from the schema
export type eTicketSchema = z.infer<typeof eTicketSchema>;
