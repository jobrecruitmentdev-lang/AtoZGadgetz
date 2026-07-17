import nodemailer from "nodemailer";
import { logger } from "./logger.js";
export const sendResetEmail = async (email, token) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    try {
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            logger.warn("SMTP credentials not configured. Reset email not sent.");
            logger.info(`[Fallback Email Mock] To: ${email}, Link: ${resetLink}`);
            return;
        }
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        await transporter.sendMail({
            from: process.env.SMTP_FROM || `"AtoZ Gadgetz" <no-reply@atozgadgetz.com>`,
            to: email,
            subject: "Password Reset Request",
            html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 30 minutes.</p>
      `,
        });
        logger.info(`Password reset email sent to ${email}`);
    }
    catch (error) {
        logger.error({ error }, "Error sending password reset email");
        throw new Error("Failed to send reset email");
    }
};
//# sourceMappingURL=mailer.js.map