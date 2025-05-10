import { db } from "~/server/db/client";
import { UserRole } from "@prisma/client";
import { verifyPassword, hashPassword } from "./auth-utils";

// Re-export the password functions for convenience
export { verifyPassword, hashPassword } from "./auth-utils";

/**
 * Finds a user by email
 */
export async function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
  });
}

/**
 * Authenticates a user with email and password
 */
export async function authenticateUser(email: string, password: string) {
  try {
    // Find the user by email
    const user = await findUserByEmail(email);

    // If user doesn't exist or password doesn't match
    if (!user || !user.password) {
      return null;
    }

    // Verify password
    const isValid = verifyPassword(user.password, password);
    if (!isValid) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error in authenticateUser:", error);
    return null;
  }
}

/**
 * Creates a new user
 */
export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  image?: string;
  role?: UserRole;
}) {
  const { password, role = UserRole.BUYER, ...userData } = data;

  return db.user.create({
    data: {
      ...userData,
      password: hashPassword(password),
      role, // Use provided role or default to BUYER
    },
  });
}

/**
 * Updates a user's profile
 */
export async function updateUserProfile(userId: string, data: {
  name?: string;
  image?: string;
}) {
  return db.user.update({
    where: { id: userId },
    data,
  });
}

/**
 * Changes a user's password
 */
export async function changePassword(userId: string, newPassword: string) {
  return db.user.update({
    where: { id: userId },
    data: {
      password: hashPassword(newPassword),
    },
  });
}

/**
 * Verifies a user's email
 */
export async function verifyEmail(userId: string) {
  return db.user.update({
    where: { id: userId },
    data: {
      emailVerified: new Date(),
    },
  });
}

/**
 * Gets a user by ID
 */
export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
  });
}
