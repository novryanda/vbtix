import { auth } from "./index";
import { UserRole } from "@prisma/client";

/**
 * Gets the current session
 */
export async function getSession() {
  return await auth();
}

/**
 * Gets the current user from the session
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Checks if the current user is authenticated
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Checks if the current user has the specified role
 */
export async function hasRole(role: UserRole | UserRole[]) {
  const user = await getCurrentUser();
  if (!user) return false;

  if (Array.isArray(role)) {
    return role.includes(user.role as UserRole);
  }

  return user.role === role;
}

/**
 * Checks if the current user is an admin
 */
export async function isAdmin() {
  return hasRole(UserRole.ADMIN);
}

/**
 * Checks if the current user is an organizer
 */
export async function isOrganizer() {
  return hasRole([UserRole.ORGANIZER, UserRole.ADMIN]);
}

/**
 * Checks if the current user is a buyer
 */
export async function isBuyer() {
  return hasRole(UserRole.BUYER);
}
