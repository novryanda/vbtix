import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";

import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import type { NextAuthOptions } from "next-auth";

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
        const authStartTime = Date.now();
        console.log("🔐 Credentials provider called");

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

          const validationStartTime = Date.now();
          const result = credentialsSchema.safeParse(credentials);
          if (!result.success) {
            // Use a simpler error message to avoid potential undefined errors
            throw new Error("Validasi gagal: Email atau password tidak valid");
          }
          console.log(
            `Schema validation took: ${Date.now() - validationStartTime}ms`,
          );

          const { email, password } = result.data;

          // Validasi kredensial
          const credentialsStartTime = Date.now();
          const user = await validateCredentials(email, password);
          console.log(
            `validateCredentials took: ${Date.now() - credentialsStartTime}ms`,
          );

          if (!user) {
            throw new Error("Email atau password salah");
          }

          // Cek apakah email sudah diverifikasi
          if (!user.emailVerified) {
            throw new Error("EmailNotVerified");
          }

          console.log(`Total auth time: ${Date.now() - authStartTime}ms`);
          console.log(
            `User authenticated: ${user.email} with role: ${user.role}`,
          );
          return user;
        } catch (error) {
          console.log(`Auth failed after: ${Date.now() - authStartTime}ms`);
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("Terjadi kesalahan saat login");
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log("[NextAuth] Redirect callback called:", { url, baseUrl });

      // Handle redirect after sign in
      if (url.startsWith("/")) {
        // Relative URL - make it absolute
        const finalUrl = `${baseUrl}${url}`;
        console.log("[NextAuth] Relative URL redirect:", finalUrl);
        return finalUrl;
      } else if (new URL(url).origin === baseUrl) {
        // Same origin - allow
        console.log("[NextAuth] Same origin redirect:", url);
        return url;
      }
      // Default to dashboard for external URLs
      const defaultUrl = `${baseUrl}/dashboard`;
      console.log("[NextAuth] Default dashboard redirect:", defaultUrl);
      return defaultUrl;
    },
    async signIn({ user, account }) {
      console.log("[NextAuth] SignIn callback called:", {
        userEmail: user.email,
        provider: account?.provider,
        timestamp: new Date().toISOString(),
      });

      // Hanya izinkan pengguna dengan email terverifikasi
      if (!user.email) {
        console.log("[NextAuth] SignIn rejected: No email");
        return false;
      }

      // Jika login dengan OAuth, pastikan user ada di database
      if (account?.provider === "google") {
        console.log(
          "[NextAuth] Google OAuth login, checking user in database...",
        );

        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            console.log("[NextAuth] Creating new user for Google OAuth...");
            // Buat user baru jika belum ada dengan role BUYER sebagai default
            // User bisa upgrade ke ORGANIZER melalui complete registration flow
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                role: UserRole.BUYER,
                emailVerified: new Date(), // OAuth email sudah terverifikasi
              },
            });
            console.log("[NextAuth] New user created successfully");
          } else {
            console.log("[NextAuth] Existing user found");
          }
        } catch (error) {
          console.error("[NextAuth] Database error during signIn:", error);
          return false;
        }
      }

      console.log("[NextAuth] SignIn successful");
      return true;
    },
    async jwt({ token, user }) {
      console.log("[NextAuth] JWT callback called:", {
        hasUser: !!user,
        tokenEmail: token.email,
        tokenId: token.id,
        tokenRole: token.role,
      });

      // Tambahkan data user ke token saat login pertama kali
      if (user) {
        console.log("[NextAuth] Adding user data to token:", {
          userId: user.id,
          userRole: user.role,
        });
        token.id = user.id;
        token.role = user.role;
      }

      // Only fetch from database if we absolutely need to and don't have the data
      if (!token.role && !token.id && token.email) {
        console.log("[NextAuth] Fetching user data from database...");
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, role: true }, // Only select what we need
          });

          if (dbUser) {
            console.log("[NextAuth] User found in database:", {
              id: dbUser.id,
              role: dbUser.role,
            });
            token.id = dbUser.id;
            token.role = dbUser.role;
          } else {
            console.log("[NextAuth] User not found in database");
          }
        } catch (error) {
          console.error(
            "[NextAuth] Error fetching user in JWT callback:",
            error,
          );
          // Don't throw, just continue without the data
        }
      }

      console.log("[NextAuth] JWT callback complete:", {
        tokenId: token.id,
        tokenRole: token.role,
      });
      return token;
    },
    async session({ session, token }) {
      console.log("[NextAuth] Session callback called:", {
        sessionUserEmail: session.user?.email,
        tokenId: token.id,
        tokenRole: token.role,
      });

      // Tambahkan data dari token ke session
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        console.log("[NextAuth] Session updated with token data:", {
          userId: session.user.id,
          userRole: session.user.role,
        });
      }

      console.log("[NextAuth] Session callback complete");
      return session;
    },
  },
};
