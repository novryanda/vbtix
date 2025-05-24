/**
 * Utility functions for generating unique codes, IDs, etc.
 */

import { randomBytes } from "crypto";

/**
 * Generate a unique code for tickets, vouchers, etc.
 * @returns {string} A unique alphanumeric code
 */
export function generateUniqueCode(length: number = 12): string {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length)
    .toUpperCase();
}

/**
 * Generate a session ID for guest users
 * @returns {string} A unique session ID
 */
export function generateSessionId(): string {
  return `sess_${Date.now()}_${randomBytes(8).toString("hex")}`;
}

/**
 * Generate a reservation code for display purposes
 * @returns {string} A human-readable reservation code
 */
export function generateReservationCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(3).toString("hex").toUpperCase();
  return `RES-${timestamp}-${random}`;
}

/**
 * Generate a random password
 * @param {number} length - Length of the password
 * @returns {string} A random password
 */
export function generateRandomPassword(length: number = 10): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }

  return password;
}

/**
 * Generate a unique invoice number
 * @returns {string} A unique invoice number
 */
export function generateInvoiceNumber(): string {
  const prefix = "INV";
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `${prefix}-${timestamp}-${random}`;
}
