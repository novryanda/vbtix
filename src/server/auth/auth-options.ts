import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";

import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import type { JWT } from "next-auth/jwt";
import type { NextAuthOptions } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";

import { env } from "~/env";
import { prisma } from "~/server/db/client";
import { validateCredentials } from "~/server/services/auth.service";

/**
 * Opsi untuk NextAuth.js yang digunakan untuk mengonfigurasi
 * adapters, providers, callbacks, dll.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  // @ts-expect-error - PrismaAdapter has compatibility issues with NextAuthOptions type
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify-request",
  },
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: UserRole.BUYER, // Default role untuk pengguna baru
        };
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validasi input dengan Zod
        const credentialsSchema = z.object({
          email: z.string().email("Email tidak valid"),
          password: z.string().min(6, "Password minimal 6 karakter"),
        });

        try {
          // Validasi input
          if (!credentials) {
            throw new Error("Kredensial tidak diberikan");
          }

          const result = credentialsSchema.safeParse(credentials);
          if (!result.success) {
            // Use a simpler error message to avoid potential undefined errors
            throw new Error("Validasi gagal: Email atau password tidak valid");
          }

          const { email, password } = result.data;

          // Validasi kredensial
          const user = await validateCredentials(email, password);
          if (!user) {
            throw new Error("Email atau password salah");
          }

          // Cek apakah email sudah diverifikasi
          if (!user.emailVerified) {
            throw new Error("EmailNotVerified");
          }

          return user;
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("Terjadi kesalahan saat login");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Hanya izinkan pengguna dengan email terverifikasi
      if (!user.email) {
        return false;
      }

      // Jika login dengan OAuth, pastikan user ada di database
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Buat user baru jika belum ada
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              role: UserRole.BUYER,
              emailVerified: new Date(), // OAuth email sudah terverifikasi
            },
          });
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      // Tambahkan data user ke token saat login pertama kali
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // Jika token sudah ada tapi tidak memiliki role, ambil dari database
      if (!token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Tambahkan data dari token ke session
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }

      return session;
    },
  },
};
