import { z } from "zod";

/**
 * Schema validasi untuk login
 */
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

/**
 * Schema validasi untuk register
 */
export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password dan konfirmasi password tidak sama",
  path: ["confirmPassword"],
});

/**
 * Schema validasi untuk reset password
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token reset password diperlukan"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password dan konfirmasi password tidak sama",
  path: ["confirmPassword"],
});

/**
 * Schema validasi untuk request reset password
 */
export const requestResetSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

/**
 * Schema validasi untuk verifikasi email
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token verifikasi diperlukan"),
});

/**
 * Schema validasi untuk update profile
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Password minimal 6 karakter").optional(),
  confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter").optional(),
}).refine((data) => {
  // Jika newPassword diisi, confirmPassword harus sama
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Password dan konfirmasi password tidak sama",
  path: ["confirmPassword"],
}).refine((data) => {
  // Jika newPassword diisi, currentPassword harus diisi
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Password saat ini diperlukan untuk mengubah password",
  path: ["currentPassword"],
});
