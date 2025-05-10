import crypto from "crypto";

/**
 * Verifies a password against a stored hash
 * This function uses Node.js crypto and should NOT be used in Edge Runtime
 */
export function verifyPassword(storedPassword: string, suppliedPassword: string): boolean {
  const [salt, storedHash] = storedPassword.split(':');
  const suppliedHash = crypto.pbkdf2Sync(suppliedPassword, salt, 1000, 64, 'sha512').toString('hex');
  return storedHash === suppliedHash;
}

/**
 * Hashes a password for storage
 * This function uses Node.js crypto and should NOT be used in Edge Runtime
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Generates a random token
 * This function uses Node.js crypto and should NOT be used in Edge Runtime
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generates a verification token with expiration
 */
export function generateVerificationToken(identifier: string, expiresIn: number = 3600000): { token: string, expires: Date } {
  const token = generateToken();
  const expires = new Date(Date.now() + expiresIn); // Default: 1 hour
  
  return {
    token,
    expires
  };
}
