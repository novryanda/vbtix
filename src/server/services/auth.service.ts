import { UserRole } from "@prisma/client";
import { hash, compare } from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "~/server/db/client";

/**
 * Mendapatkan rute dashboard berdasarkan peran pengguna
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
 * Mendaftarkan pengguna baru
 */
export const registerUser = async (
  email: string,
  password: string,
  name?: string
) => {
  // Cek apakah email sudah terdaftar
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email sudah terdaftar");
  }

  // Hash password
  const hashedPassword = await hash(password, 12);

  // Buat token verifikasi
  const verificationToken = randomBytes(32).toString("hex");
  const tokenExpiry = new Date();
  tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token berlaku 24 jam

  // Buat user baru
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: UserRole.BUYER, // Default role
    },
  });

  // Simpan token verifikasi
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: verificationToken,
      expires: tokenExpiry,
    },
  });

  // Kirim email verifikasi (implementasi akan dibuat nanti)
  // await sendVerificationEmail(email, verificationToken);

  return user;
};

/**
 * Verifikasi email pengguna
 */
export const verifyEmail = async (token: string) => {
  // Cari token verifikasi
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    throw new Error("Token verifikasi tidak valid");
  }

  // Cek apakah token sudah kadaluarsa
  if (verificationToken.expires < new Date()) {
    throw new Error("Token verifikasi sudah kadaluarsa");
  }

  // Update status verifikasi email
  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  // Hapus token verifikasi
  await prisma.verificationToken.delete({
    where: { token },
  });

  return true;
};

/**
 * Mengirim email reset password
 */
export const requestPasswordReset = async (email: string) => {
  // Cek apakah email terdaftar
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Email tidak terdaftar");
  }

  // Buat token reset password
  const resetToken = randomBytes(32).toString("hex");
  const tokenExpiry = new Date();
  tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token berlaku 1 jam

  // Simpan token reset password
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: resetToken,
      expires: tokenExpiry,
    },
  });

  // Kirim email reset password (implementasi akan dibuat nanti)
  // await sendPasswordResetEmail(email, resetToken);

  return true;
};

/**
 * Reset password pengguna
 */
export const resetPassword = async (token: string, newPassword: string) => {
  // Cari token reset password
  const resetToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!resetToken) {
    throw new Error("Token reset password tidak valid");
  }

  // Cek apakah token sudah kadaluarsa
  if (resetToken.expires < new Date()) {
    throw new Error("Token reset password sudah kadaluarsa");
  }

  // Hash password baru
  const hashedPassword = await hash(newPassword, 12);

  // Update password
  await prisma.user.update({
    where: { email: resetToken.identifier },
    data: { password: hashedPassword },
  });

  // Hapus token reset password
  await prisma.verificationToken.delete({
    where: { token },
  });

  return true;
};

/**
 * Validasi kredensial pengguna
 */
export const validateCredentials = async (email: string, password: string) => {
  // Cari user berdasarkan email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    return null;
  }

  // Verifikasi password
  const isValid = await compare(password, user.password);

  if (!isValid) {
    return null;
  }

  return user;
};

/**
 * Cek apakah email sudah terverifikasi
 */
export const isEmailVerified = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  });

  return !!user?.emailVerified;
};