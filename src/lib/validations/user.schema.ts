import { z } from "zod";
import { UserRole } from "@prisma/client";

// Schema for creating a new user
export const createUserSchema = z.object({
  name: z.string().min(2, { message: "Nama harus minimal 2 karakter" }).optional(),
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password harus minimal 6 karakter" }),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
});

// Schema for updating a user
export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
});

// Schema for filtering users
export const userFilterSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

// Schema for validating user ID
export const userIdSchema = z.string().uuid({ message: "ID harus berupa UUID yang valid" });

// Schema for pagination validation
export const userPaginationSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
});

// Types derived from schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserFilterInput = z.infer<typeof userFilterSchema>;
