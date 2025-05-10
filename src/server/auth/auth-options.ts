import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { env } from "~/env.js";
import { db } from "~/server/db/client";
import { authenticateUser } from "~/server/services/auth.service";

/**
 * NextAuth configuration options
 */
export const authOptions: NextAuthConfig = {
  // Use Prisma adapter for database integration
  adapter: PrismaAdapter(db),

  // Configure session strategy
  session: {
    strategy: "jwt",
  },

  // Configure pages
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/login",
    verifyRequest: "/verify-request",
    newUser: "/register",
  },

  // Configure callbacks
  callbacks: {
    // Redirect callback
    redirect({ url, baseUrl }) {
      // If the URL is absolute and starts with the base URL, allow it
      if (url.startsWith(baseUrl)) return url;
      // If the URL is relative, prepend the base URL
      if (url.startsWith("/")) return new URL(url, baseUrl).toString();
      // Otherwise, return to the dashboard
      return "/";
    },

    // Customize JWT token
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },

    // Customize session object
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string | null;
      }
      return session;
    },

    // Customize authorized callback
    authorized: async ({ auth, request }) => {
      return !!auth?.user;
    },
  },

  // Configure authentication providers
  providers: [
    // Google OAuth provider
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),

    // Credentials provider for email/password login
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate credentials
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(8),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;

        // Authenticate user with email and password
        const user = await authenticateUser(email, password);

        return user;
      },
    }),
  ],



  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
};
