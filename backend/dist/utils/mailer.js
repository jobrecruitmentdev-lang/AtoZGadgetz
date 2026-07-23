import nodemailer from "nodemailer";
import { logger } from "./logger.js";
const getMailerTransporter = () => {
    const useGmailOAuth = process.env.SMTP_PROVIDER === "gmail" &&
        !!process.env.SMTP_USER &&
        !!process.env.GOOGLE_CLIENT_ID &&
        !!process.env.GOOGLE_CLIENT_SECRET &&
        !!process.env.GOOGLE_REFRESH_TOKEN;
    const hasSmtpPasswordAuth = !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS;
    if (!useGmailOAuth && !hasSmtpPasswordAuth) {
        return null;
    }
    return useGmailOAuth
        ? nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.SMTP_USER,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            },
        })
        : nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
};
export const sendResetEmail = async (email, token) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    try {
        const transporter = getMailerTransporter();
        if (!transporter) {
            logger.warn("SMTP credentials not configured. Reset email not sent.");
            logger.info(`[Fallback Email Mock] To: ${email}, Link: ${resetLink}`);
            return;
        }
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
export const sendActivationEmail = async (email, token) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const activationLink = `${frontendUrl}/register?activationToken=${token}`;
    try {
        const transporter = getMailerTransporter();
        if (!transporter) {
            logger.warn("SMTP credentials not configured. Activation email not sent.");
            logger.info(`[Fallback Activation Email] To: ${email}, Link: ${activationLink}`);
            return;
        }
        await transporter.sendMail({
            from: process.env.SMTP_FROM || `"AtoZ Gadgetz" <no-reply@atozgadgetz.com>`,
            to: email,
            subject: "Activate your AtoZ Gadgetz account",
            html: `
        <p>Welcome to AtoZ Gadgetz!</p>
        <p>Click the link below to activate your account and complete mobile registration:</p>
        <a href="${activationLink}">${activationLink}</a>
        <p>This link will expire in 20 minutes.</p>
      `,
        });
    }
    catch (error) {
        logger.error({ error }, "Error sending activation email");
        throw new Error("Failed to send activation email");
    }
};
//# sourceMappingURL=mailer.js.map