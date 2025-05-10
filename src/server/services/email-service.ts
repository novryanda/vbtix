import { env } from "~/env.js";

/**
 * Sends a verification email to a user
 */
export async function sendVerificationEmail(email: string, token: string) {
  // In a real implementation, you would use a proper email service like Resend
  // For now, we'll just log the verification link
  const verificationUrl = `${env.NEXTAUTH_URL}/verify/${token}`;
  
  console.log(`Verification email would be sent to ${email}`);
  console.log(`Verification URL: ${verificationUrl}`);
  
  // In production, you would use something like:
  // return resend.emails.send({
  //   from: env.EMAIL_FROM,
  //   to: email,
  //   subject: "Verify your email address",
  //   html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
  // });
  
  return { success: true };
}

/**
 * Sends a password reset email to a user
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  // In a real implementation, you would use a proper email service
  const resetUrl = `${env.NEXTAUTH_URL}/reset-password/${token}`;
  
  console.log(`Password reset email would be sent to ${email}`);
  console.log(`Reset URL: ${resetUrl}`);
  
  // In production, you would use something like:
  // return resend.emails.send({
  //   from: env.EMAIL_FROM,
  //   to: email,
  //   subject: "Reset your password",
  //   html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
  // });
  
  return { success: true };
}
