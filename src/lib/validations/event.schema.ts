import { z } from "zod";
import { EventStatus } from "@prisma/client";

// Validation schema for Event
export const eventSchema = z.object({
  id: z.string(),
  slug: z.string().min(1, { message: "Slug cannot be empty" }),
  organizerId: z.string(),
  title: z.string().min(1, { message: "Title cannot be empty" }),
  description: z.string().optional().nullable(),
  posterUrl: z.string().url({ message: "Invalid URL format for posterUrl" }).optional().nullable(),
  bannerUrl: z.string().url({ message: "Invalid URL format for bannerUrl" }).optional().nullable(),
  category: z.string().optional().nullable(),
  venue: z.string().min(1, { message: "Venue cannot be empty" }),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  province: z.string().min(1, { message: "Province cannot be empty" }),
  country: z.string().min(1, { message: "Country cannot be empty" }),
  tags: z.array(z.string()),
  images: z.array(z.string()),
  featured: z.boolean(),
  published: z.boolean(),
  seatingMap: z.string().optional().nullable(),
  maxAttendees: z.number().int().positive().optional().nullable(),
  website: z.string().url({ message: "Invalid URL format for website" }).optional().nullable(),
  terms: z.string().optional().nullable(),
  startDate: z.string().datetime({ message: "Invalid datetime format for startDate" }),
  endDate: z.string().datetime({ message: "Invalid datetime format for endDate" }),
  status: z.nativeEnum(EventStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Export TypeScript type from the schema
export type EventSchema = z.infer<typeof eventSchema>;

// Schema for creating a new event
export const createEventSchema = z.object({
  title: z.string().min(1, { message: "Title cannot be empty" }),
  slug: z.string().min(1, { message: "Slug cannot be empty" }).optional(),
  description: z.string().optional(),
  posterUrl: z.string().url({ message: "Invalid URL format for posterUrl" }).optional(),
  bannerUrl: z.string().url({ message: "Invalid URL format for bannerUrl" }).optional(),
  category: z.string().optional(),
  venue: z.string().min(1, { message: "Venue cannot be empty" }),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().min(1, { message: "Province cannot be empty" }),
  country: z.string().min(1, { message: "Country cannot be empty" }),
  tags: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
  seatingMap: z.string().optional(),
  maxAttendees: z.number().int().positive().optional(),
  website: z.string().url({ message: "Invalid URL format for website" }).optional(),
  terms: z.string().optional(),
  startDate: z.string().datetime({ message: "Invalid datetime format for startDate" }),
  endDate: z.string().datetime({ message: "Invalid datetime format for endDate" }),
  status: z.nativeEnum(EventStatus).optional().default(EventStatus.DRAFT),
});

// Schema for updating an existing event
export const updateEventSchema = z.object({
  title: z.string().min(1, { message: "Title cannot be empty" }).optional(),
  slug: z.string().min(1, { message: "Slug cannot be empty" }).optional(),
  description: z.string().optional(),
  posterUrl: z.string().url({ message: "Invalid URL format for posterUrl" }).optional(),
  bannerUrl: z.string().url({ message: "Invalid URL format for bannerUrl" }).optional(),
  category: z.string().optional(),
  venue: z.string().min(1, { message: "Venue cannot be empty" }).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().min(1, { message: "Province cannot be empty" }).optional(),
  country: z.string().min(1, { message: "Country cannot be empty" }).optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  seatingMap: z.string().optional(),
  maxAttendees: z.number().int().positive().optional(),
  website: z.string().url({ message: "Invalid URL format for website" }).optional(),
  terms: z.string().optional(),
  startDate: z.string().datetime({ message: "Invalid datetime format for startDate" }).optional(),
  endDate: z.string().datetime({ message: "Invalid datetime format for endDate" }).optional(),
  status: z.nativeEnum(EventStatus).optional(),
});

// Schema for deleting an event
export const deleteEventSchema = z.object({
  id: z.string(),
});

// Schema for event approval
export const eventApprovalSchema = z.object({
  id: z.string(),
  status: z.enum([EventStatus.PUBLISHED, EventStatus.REJECTED]),
  notes: z.string().optional(),
});

// Schema for event query parameters
export const eventQuerySchema = z.object({
  page: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  status: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      if (Object.values(EventStatus).includes(val as EventStatus)) {
        return val as EventStatus;
      }
      return undefined;
    }),
  organizerId: z
    .union([z.string(), z.null()])
    .optional(),
  search: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => val || undefined),
  featured: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => {
      if (val === null || val === undefined || val === "") return undefined;
      return val.toLowerCase() === "true";
    }),
});

// Schema for submitting an event for review
export const submitEventSchema = z.object({
  id: z.string(),
});

// Schema for setting an event as featured
export const setEventFeaturedSchema = z.object({
  id: z.string(),
  featured: z.boolean(),
});

// Export TypeScript types for the schemas
export type CreateEventSchema = z.infer<typeof createEventSchema>;
export type UpdateEventSchema = z.infer<typeof updateEventSchema>;
export type DeleteEventSchema = z.infer<typeof deleteEventSchema>;
export type EventApprovalSchema = z.infer<typeof eventApprovalSchema>;
export type EventQuerySchema = z.infer<typeof eventQuerySchema>;
export type SubmitEventSchema = z.infer<typeof submitEventSchema>;
export type SetEventFeaturedSchema = z.infer<typeof setEventFeaturedSchema>;
