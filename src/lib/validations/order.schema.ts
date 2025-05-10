import { z } from "zod";

export const OrderItemSchema = z.object({
  ticketTypeId: z.string().nonempty("Ticket Type ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be a positive number"),
});

export const OrderSchema = z.object({
  userId: z.string().nonempty("User ID is required"),
  eventId: z.string().nonempty("Event ID is required"),
  amount: z.number().min(0, "Amount must be a positive number"),
  currency: z.string().default("IDR"),
  orderItems: z.array(OrderItemSchema).nonempty("Order must have at least one item"),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
