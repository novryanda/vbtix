import { z } from "zod";
import { EventStatus } from "@prisma/client";

// Schema for creating a new event
export const createEventSchema = z.object({
  title: z.string().min(5, { message: "Judul harus minimal 5 karakter" }).max(100),
  description: z.string().min(20, { message: "Deskripsi harus minimal 20 karakter" }).max(5000).optional(),
  organizerId: z.string(),
  venue: z.string().min(3, { message: "Venue harus minimal 3 karakter" }),
  address: z.string().min(10, { message: "Alamat harus minimal 10 karakter" }).optional(),
  city: z.string().min(3, { message: "Kota harus minimal 3 karakter" }).optional(),
  category: z.string().min(3, { message: "Kategori harus minimal 3 karakter" }).optional(),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date().optional(),
  posterUrl: z.string().url({ message: "URL poster tidak valid" }).optional(),
  bannerUrl: z.string().url({ message: "URL banner tidak valid" }).optional(),
});

// Schema for updating an event
export const updateEventSchema = createEventSchema.partial().extend({
  status: z.nativeEnum(EventStatus).optional(),
});

// Schema for submitting an event for review
export const submitEventSchema = z.object({
  id: z.string(),
});

// Schema for approving or rejecting an event
export const reviewEventSchema = z.object({
  id: z.string(),
  status: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().optional(),
});

// Schema for filtering events
export const eventFilterSchema = z.object({
  status: z.nativeEnum(EventStatus).optional(),
  organizerId: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  search: z.string().optional(),
  upcoming: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

// Types derived from schemas
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type SubmitEventInput = z.infer<typeof submitEventSchema>;
export type ReviewEventInput = z.infer<typeof reviewEventSchema>;
export type EventFilterInput = z.infer<typeof eventFilterSchema>;
