
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Resend } from "resend";

/**
 * Merges Tailwind classes conditionally
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sends a password reset email using Resend
 * @param email User's email
 * @param resetLink Generated reset link
 */
export async function sendResetEmail(email: string, resetLink: string) {
  const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: "support@yourdomain.com",
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send reset email");
  }
}

