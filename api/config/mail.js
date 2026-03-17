import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * SMTP Transporter Configuration
 * Uses company-provided SMTP server for email sending
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Verify SMTP connection on startup
 */
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Error:", error.message);
  } else {
    console.log("✅ SMTP Server Ready for Message Delivery");
  }
});

export { transporter };
export const COMPANY_EMAIL =
  process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
export const FROM_NAME = process.env.SMTP_FROM_NAME || "Flexus Solutions";
export const EMAIL_CC_RECIPIENTS = (
  process.env.EMAIL_CC_RECIPIENTS ||
  "petersonpaul@flexussolutions.com,joeliheanacho@flexussolutions.com"
)
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);
