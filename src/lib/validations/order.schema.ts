import { z } from "zod";
import { OrderStatus } from "@prisma/client";

// Schema for creating a new order
export const createOrderSchema = z.object({
  eventId: z.string(),
  items: z.array(
    z.object({
      ticketTypeId: z.string(),
      quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
    })
  ).min(1, { message: "At least one item is required" }),
  promoCode: z.string().optional(),
});

// Schema for updating an order
export const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  promoCode: z.string().optional(),
});

// Schema for cancelling an order
export const cancelOrderSchema = z.object({
  reason: z.string().optional(),
});

// Schema for filtering orders
export const orderFilterSchema = z.object({
  userId: z.string().optional(),
  eventId: z.string().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

// Types derived from schemas
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type OrderFilterInput = z.infer<typeof orderFilterSchema>;