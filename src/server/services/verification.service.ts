import { db } from "~/server/db/client";
import { generateToken } from "./auth-utils";

/**
 * Generates a verification token for email verification or password reset
 */
export async function generateVerificationToken(identifier: string, expiresIn: number = 3600000) {
  // Default expiration: 1 hour
  const expires = new Date(Date.now() + expiresIn);
  const token = generateToken();

  // Delete any existing tokens for this identifier
  await db.verificationToken.deleteMany({
    where: { identifier },
  });

  // Create a new token
  await db.verificationToken.create({
    data: {
      identifier,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Verifies a token and returns the associated identifier (usually an email)
 */
export async function verifyToken(token: string) {
  try {
    // Find the token
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return { success: false, message: "Invalid token" };
    }

    // Check if token is expired
    if (new Date() > verificationToken.expires) {
      return { success: false, message: "Token has expired" };
    }

    // Return the identifier (usually an email)
    return {
      success: true,
      message: "Token verified successfully",
      identifier: verificationToken.identifier,
    };
  } catch (error) {
    console.error("Error verifying token:", error);
    return { success: false, message: "An error occurred during verification" };
  }
}

/**
 * Consumes a token (deletes it after use)
 */
export async function consumeToken(token: string) {
  try {
    await db.verificationToken.delete({
      where: { token },
    });
    return true;
  } catch (error) {
    console.error("Error consuming token:", error);
    return false;
  }
}
