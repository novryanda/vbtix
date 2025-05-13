import { z } from "zod";
import type {Enums} from "~/types/supabase";

// Menggunakan tipe UserRole dari Supabase
type UserRole = Enums<"user_role">;

// Schema untuk validasi pembuatan user
export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]+$/, "Invalid phone number format")
    .min(10, "Phone number must be at least 10 digits")
    .max(20)
    .optional(),
  role: z.enum(["ADMIN", "ORGANIZER", "BUYER"] as const).optional(),
});

// Schema untuk validasi update user
export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]+$/, "Invalid phone number format")
    .min(10, "Phone number must be at least 10 digits")
    .max(20)
    .optional(),
  image: z.string().url("Invalid image URL").optional().nullable(),
});

// Schema untuk validasi perubahan role
export const changeRoleSchema = z.object({
  role: z.enum(["ADMIN", "ORGANIZER", "BUYER"] as const, {
    errorMap: () => ({ message: "Invalid role" }),
  }),
});

// Schema untuk validasi aktivasi/deaktivasi
export const toggleStatusSchema = z.object({
  isActive: z.boolean({
    required_error: "isActive status is required",
    invalid_type_error: "isActive must be a boolean",
  }),
});

// Schema untuk validasi reset password
export const resetPasswordSchema = z.object({
  sendEmail: z.boolean().optional().default(true),
  customPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
});

// Schema untuk validasi query parameters
export const userQuerySchema = z.object({
  page: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  role: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      if (["ADMIN", "ORGANIZER", "BUYER"].includes(val)) {
        return val as UserRole;
      }
      return undefined;
    }),
  search: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => val || undefined),
  isActive: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => {
      if (val === null || val === undefined || val === "") return undefined;
      return val.toLowerCase() === "true";
    }),
});

// Export TypeScript types dari schema
export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type ChangeRoleSchema = z.infer<typeof changeRoleSchema>;
export type ToggleStatusSchema = z.infer<typeof toggleStatusSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type UserQuerySchema = z.infer<typeof userQuerySchema>;
