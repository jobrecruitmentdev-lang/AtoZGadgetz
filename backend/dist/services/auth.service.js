import { UserRepository } from "../repositories/user.repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { prisma } from "../prisma.js";
import crypto from "crypto";
import { sendActivationEmail, sendResetEmail } from "../utils/mailer.js";
import { sendOtpSms } from "../utils/sms.js";
import { normalizeInternationalMobile } from "../utils/phone.js";
const userRepo = new UserRepository();
export class AuthService {
    async registerUser(data) {
        const normalizedMobile = normalizeInternationalMobile(data.mobile);
        const normalizedEmail = String(data.email || "").trim().toLowerCase();
        const existingUser = await userRepo.findByEmailOrMobile(normalizedEmail, normalizedMobile);
        if (existingUser) {
            throw new Error("Email or Mobile already registered");
        }
        const password_hash = await bcrypt.hash(data.password, 10);
        return userRepo.create({
            first_name: data.first_name,
            last_name: data.last_name,
            email: normalizedEmail,
            mobile: normalizedMobile,
            password_hash,
            role_id: data.role_id || 3,
        });
    }
    async loginUser(email, password_plain) {
        const normalizedEmail = String(email || "").trim().toLowerCase();
        const user = await userRepo.findByEmail(normalizedEmail);
        if (!user || !(await bcrypt.compare(password_plain, user.password_hash))) {
            throw new Error("Invalid credentials");
        }
        if (!user.is_active) {
            throw new Error("Account is not active. Please complete email activation.");
        }
        const access_token = jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, { expiresIn: "1h" });
        return access_token;
    }
    async requestActivationMagicLink(email, ip, userAgent) {
        const normalizedEmail = String(email || "").trim().toLowerCase();
        const existingUser = await userRepo.findByEmail(normalizedEmail);
        if (existingUser) {
            throw new Error("Email already registered. Please sign in.");
        }
        const rawToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
        const expiresAt = new Date(Date.now() + 20 * 60 * 1000);
        await prisma.emailActivationToken.updateMany({
            where: { email: normalizedEmail, used_at: null },
            data: { used_at: new Date() },
        });
        await prisma.emailActivationToken.create({
            data: {
                email: normalizedEmail,
                token_hash: tokenHash,
                expires_at: expiresAt,
                ip_address: ip,
                user_agent: userAgent,
            },
        });
        await sendActivationEmail(normalizedEmail, rawToken);
    }
    async verifyActivationMagicLink(token) {
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        const record = await prisma.emailActivationToken.findUnique({
            where: { token_hash: tokenHash },
        });
        if (!record || record.used_at || record.expires_at < new Date()) {
            throw new Error("Invalid or expired activation link.");
        }
        await prisma.emailActivationToken.update({
            where: { id: record.id },
            data: { used_at: new Date() },
        });
        const activation_token = jwt.sign({ purpose: "activation", email: record.email }, config.jwtSecret, { expiresIn: "20m" });
        return { activation_token, email: record.email };
    }
    async completeRegistrationFromActivation(data) {
        let decoded;
        try {
            decoded = jwt.verify(data.activation_token, config.jwtSecret);
        }
        catch {
            throw new Error("Invalid or expired activation session.");
        }
        if (decoded?.purpose !== "activation" || !decoded?.email) {
            throw new Error("Invalid activation session.");
        }
        const normalizedEmail = String(decoded.email).trim().toLowerCase();
        const normalizedMobile = normalizeInternationalMobile(data.mobile);
        const existingUser = await userRepo.findByEmailOrMobile(normalizedEmail, normalizedMobile);
        if (existingUser) {
            throw new Error("Email or Mobile already registered");
        }
        const password_hash = await bcrypt.hash(data.password, 10);
        const user = await userRepo.create({
            first_name: data.first_name,
            last_name: data.last_name,
            email: normalizedEmail,
            mobile: normalizedMobile,
            password_hash,
            role_id: 3,
            is_active: true,
        });
        return { id: user.id, email: user.email };
    }
    async completeUserProfile(userId, data) {
        const normalizedMobile = normalizeInternationalMobile(data.mobile);
        const existingMobileUser = await userRepo.findByMobile(normalizedMobile);
        if (existingMobileUser && existingMobileUser.id !== userId) {
            throw new Error("Mobile number is already registered.");
        }
        const user = await userRepo.updateById(userId, {
            first_name: data.first_name,
            last_name: data.last_name,
            mobile: normalizedMobile,
            is_active: true,
        });
        const { password_hash, ...safeUser } = user;
        return safeUser;
    }
    async forgotPassword(email, ip, userAgent) {
        const user = await userRepo.findByEmail(email);
        // "Always respond: If an account exists, we'll send a reset email."
        if (!user)
            return;
        // Generate secure token (32 bytes)
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        // Expire in 30 minutes
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 30);
        await prisma.passwordResetToken.create({
            data: {
                user_id: user.id,
                token_hash: tokenHash,
                expires_at: expiresAt,
                ip_address: ip,
                user_agent: userAgent
            }
        });
        // In a real app, send the rawToken via email here.
        await sendResetEmail(email, rawToken);
    }
    async resetPassword(token, newPassword) {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token_hash: tokenHash }
        });
        if (!resetToken)
            throw new Error("Invalid or expired token");
        if (resetToken.used_at)
            throw new Error("Token has already been used");
        if (resetToken.expires_at < new Date())
            throw new Error("Invalid or expired token");
        const password_hash = await bcrypt.hash(newPassword, 10);
        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetToken.user_id },
                data: { password_hash }
            }),
            prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { used_at: new Date() }
            }),
            prisma.userSession.updateMany({
                where: { user_id: resetToken.user_id, is_active: true },
                data: { is_active: false }
            }),
            prisma.refreshToken.deleteMany({
                where: { user_id: resetToken.user_id }
            })
        ]);
    }
    async sendMobileOtp(mobile, purpose, ip, userAgent) {
        const normalizedMobile = normalizeInternationalMobile(mobile);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentCount = await prisma.mobileOtp.count({
            where: {
                mobile: normalizedMobile,
                purpose,
                created_at: { gte: oneHourAgo }
            }
        });
        if (recentCount >= 5) {
            throw new Error("Too many OTP requests. Please try again later.");
        }
        const otp = String(crypto.randomInt(100000, 1000000));
        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await prisma.mobileOtp.updateMany({
            where: { mobile: normalizedMobile, purpose, used_at: null },
            data: { used_at: new Date() }
        });
        await prisma.mobileOtp.create({
            data: {
                mobile: normalizedMobile,
                otp_hash: otpHash,
                purpose,
                expires_at: expiresAt,
                ip_address: ip,
                user_agent: userAgent
            }
        });
        await sendOtpSms(normalizedMobile, otp);
    }
    async verifyMobileOtp(mobile, otp, purpose) {
        const normalizedMobile = normalizeInternationalMobile(mobile);
        if (!otp)
            throw new Error("Mobile and OTP are required");
        const otpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");
        const otpRecord = await prisma.mobileOtp.findFirst({
            where: {
                mobile: normalizedMobile,
                purpose,
                used_at: null
            },
            orderBy: { created_at: "desc" }
        });
        if (!otpRecord)
            throw new Error("Invalid or expired OTP");
        if (otpRecord.expires_at < new Date())
            throw new Error("Invalid or expired OTP");
        if (otpRecord.otp_hash !== otpHash) {
            const nextAttempts = otpRecord.attempts + 1;
            await prisma.mobileOtp.update({
                where: { id: otpRecord.id },
                data: {
                    attempts: nextAttempts,
                    used_at: nextAttempts >= 5 ? new Date() : null
                }
            });
            throw new Error("Invalid or expired OTP");
        }
        await prisma.mobileOtp.update({
            where: { id: otpRecord.id },
            data: { used_at: new Date() }
        });
        const user = await userRepo.findByMobile(normalizedMobile);
        if (!user) {
            return { verified: true, userExists: false };
        }
        const access_token = jwt.sign({ sub: user.id, email: user.email, mobile: user.mobile }, config.jwtSecret, { expiresIn: "1h" });
        return {
            verified: true,
            userExists: true,
            access_token,
            token_type: "bearer",
        };
    }
}
//# sourceMappingURL=auth.service.js.map