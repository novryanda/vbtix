import { z } from "zod";

/**
 * Identity types for Indonesian users
 */
export const IdentityType = z.enum([
  "KTP",
  "PASSPORT",
  "SIM",
  "KITAS",
  "KITAP",
]);

/**
 * Schema for buyer information (Data Pemesan)
 */
export const buyerInfoSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Nama lengkap minimal 2 karakter" })
    .max(100, { message: "Nama lengkap maksimal 100 karakter" }),
  identityType: IdentityType,
  identityNumber: z
    .string()
    .min(8, { message: "Nomor identitas minimal 8 karakter" })
    .max(20, { message: "Nomor identitas maksimal 20 karakter" })
    .regex(/^[0-9A-Za-z]+$/, {
      message: "Nomor identitas hanya boleh berisi huruf dan angka",
    }),
  email: z
    .string()
    .email({ message: "Format email tidak valid" })
    .max(100, { message: "Email maksimal 100 karakter" }),
  whatsapp: z
    .string()
    .min(10, { message: "Nomor WhatsApp minimal 10 digit" })
    .max(15, { message: "Nomor WhatsApp maksimal 15 digit" })
    .regex(/^[0-9+]+$/, {
      message: "Nomor WhatsApp hanya boleh berisi angka dan tanda +",
    })
    .refine(
      (val) =>
        val.startsWith("62") || val.startsWith("+62") || val.startsWith("08"),
      {
        message: "Nomor WhatsApp harus dimulai dengan 62, +62, atau 08",
      },
    ),
});

/**
 * Schema for ticket holder information (Data Pemilik Tiket)
 */
export const ticketHolderSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Nama lengkap minimal 2 karakter" })
    .max(100, { message: "Nama lengkap maksimal 100 karakter" }),
  identityType: IdentityType,
  identityNumber: z
    .string()
    .min(8, { message: "Nomor identitas minimal 8 karakter" })
    .max(20, { message: "Nomor identitas maksimal 20 karakter" })
    .regex(/^[0-9A-Za-z]+$/, {
      message: "Nomor identitas hanya boleh berisi huruf dan angka",
    }),
  email: z
    .string()
    .email({ message: "Format email tidak valid" })
    .max(100, { message: "Email maksimal 100 karakter" }),
  whatsapp: z
    .string()
    .min(10, { message: "Nomor WhatsApp minimal 10 digit" })
    .max(15, { message: "Nomor WhatsApp maksimal 15 digit" })
    .regex(/^[0-9+]+$/, {
      message: "Nomor WhatsApp hanya boleh berisi angka dan tanda +",
    })
    .refine(
      (val) =>
        val.startsWith("62") || val.startsWith("+62") || val.startsWith("08"),
      {
        message: "Nomor WhatsApp harus dimulai dengan 62, +62, atau 08",
      },
    ),
});

/**
 * Schema for single ticket type purchase
 * Public users can only buy one ticket type per transaction
 */
export const singleTicketPurchaseSchema = z.object({
  ticketTypeId: z.string().min(1, { message: "Ticket type ID is required" }),
  quantity: z
    .number()
    .int()
    .positive({ message: "Quantity must be a positive integer" })
    .max(10, { message: "Maximum 10 tickets per purchase" }),
});

/**
 * Complete ticket purchase schema for public users
 * Enforces single ticket type per transaction
 */
export const ticketPurchaseSchema = z
  .object({
    // Buyer information
    buyerInfo: buyerInfoSchema,

    // Single ticket type purchase
    ticketPurchase: singleTicketPurchaseSchema,

    // Ticket holders (one for each ticket)
    ticketHolders: z
      .array(ticketHolderSchema)
      .min(1, { message: "At least one ticket holder is required" }),
  })
  .refine(
    (data) => {
      // Check if ticket holders count matches quantity
      return data.ticketHolders.length === data.ticketPurchase.quantity;
    },
    {
      message: "Number of ticket holders must match ticket quantity",
      path: ["ticketHolders"],
    },
  );

/**
 * Legacy schema for backward compatibility (organizer bulk purchases)
 * Allows multiple ticket types - used only for organizer operations
 */
export const ticketPurchaseItemSchema = z.object({
  ticketTypeId: z.string().min(1, { message: "Ticket type ID is required" }),
  quantity: z
    .number()
    .int()
    .positive({ message: "Quantity must be a positive integer" })
    .max(10, { message: "Maximum 10 tickets per type" }),
});

export const bulkTicketPurchaseSchema = z
  .object({
    // Buyer information
    buyerInfo: buyerInfoSchema,

    // Multiple ticket items (for organizer use)
    items: z
      .array(ticketPurchaseItemSchema)
      .min(1, { message: "At least one ticket must be selected" }),

    // Ticket holders (one for each ticket)
    ticketHolders: z
      .array(ticketHolderSchema)
      .min(1, { message: "At least one ticket holder is required" }),
  })
  .refine(
    (data) => {
      // Calculate total tickets from items
      const totalTickets = data.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      // Check if ticket holders count matches total tickets
      return data.ticketHolders.length === totalTickets;
    },
    {
      message: "Number of ticket holders must match total number of tickets",
      path: ["ticketHolders"],
    },
  );

/**
 * TypeScript types
 */
export type BuyerInfoSchema = z.infer<typeof buyerInfoSchema>;
export type TicketHolderSchema = z.infer<typeof ticketHolderSchema>;
export type SingleTicketPurchaseSchema = z.infer<
  typeof singleTicketPurchaseSchema
>;
export type TicketPurchaseSchema = z.infer<typeof ticketPurchaseSchema>;
export type TicketPurchaseItemSchema = z.infer<typeof ticketPurchaseItemSchema>;
export type BulkTicketPurchaseSchema = z.infer<typeof bulkTicketPurchaseSchema>;

/**
 * Schema for updating buyer info
 */
export const updateBuyerInfoSchema = buyerInfoSchema.partial();

/**
 * Schema for updating ticket holder info
 */
export const updateTicketHolderSchema = ticketHolderSchema.partial();

/**
 * Helper function to format WhatsApp number
 */
export function formatWhatsAppNumber(whatsapp: string): string {
  // Remove any non-digit characters except +
  let cleaned = whatsapp.replace(/[^\d+]/g, "");

  // Convert 08 to +62
  if (cleaned.startsWith("08")) {
    cleaned = "+62" + cleaned.substring(2);
  }
  // Add + if starts with 62
  else if (cleaned.startsWith("62") && !cleaned.startsWith("+62")) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
}

/**
 * Helper function to validate Indonesian phone number
 */
export function isValidIndonesianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return /^(\+62|62|08)[0-9]{8,13}$/.test(cleaned);
}
