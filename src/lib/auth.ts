"use client";

import { signIn, signOut } from "next-auth/react";
import { UserRole } from "@prisma/client";

/**
 * Mendapatkan rute dashboard berdasarkan peran pengguna
 * Fungsi ini digunakan di client-side
 */
export const getDashboardRoute = (role?: UserRole | string | null) => {
  if (!role) return "/";

  switch (role) {
    case UserRole.ADMIN:
      return "/admin";
    case UserRole.ORGANIZER:
      return "/organizer";
    case UserRole.BUYER:
    default:
      return "/buyer";
  }
};

/**
 * Fungsi untuk login dengan kredensial (email/password)
 */
export const login = async (email: string, password: string, callbackUrl?: string) => {
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Terjadi kesalahan saat login" };
  }
};

/**
 * Fungsi untuk login dengan Google
 */
export const loginWithGoogle = async (callbackUrl?: string) => {
  await signIn("google", { callbackUrl });
};

/**
 * Fungsi untuk logout
 */
export const logout = async () => {
  await signOut({ redirect: false });
};

/**
 * Mendapatkan pesan error autentikasi berdasarkan kode error
 */
export const getAuthErrorMessage = (error?: string | null) => {
  if (!error) return "Terjadi kesalahan saat autentikasi";

  switch (error) {
    case "CredentialsSignin":
      return "Email atau password salah";
    case "EmailNotVerified":
      return "Email belum diverifikasi. Silakan periksa email Anda.";
    case "AccessDenied":
      return "Akses ditolak. Hubungi administrator.";
    case "OAuthAccountNotLinked":
      return "Email sudah terdaftar dengan metode login lain.";
    case "OAuthSignInError":
      return "Terjadi kesalahan saat login dengan provider eksternal.";
    case "SessionRequired":
      return "Anda perlu login untuk mengakses halaman ini.";
    default:
      return `Terjadi kesalahan: ${error}`;
  }
};
