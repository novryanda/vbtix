import NextAuth from "next-auth";
import { authOptions } from "./auth-options";

/**
 * NextAuth.js Auth handler
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

/**
 * Auth helper function to get the current session
 * Use this in server components and API routes
 */
export { auth };
