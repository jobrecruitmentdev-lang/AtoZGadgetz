import { UserRepository } from "../repositories/user.repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { prisma } from "../prisma.js";
import crypto from "crypto";
import { sendResetEmail } from "../utils/mailer.js";
const userRepo = new UserRepository();
export class AuthService {
    async registerUser(data) {
        const existingUser = await userRepo.findByEmailOrMobile(data.email, data.mobile);
        if (existingUser) {
            throw new Error("Email or Mobile already registered");
        }
        const password_hash = await bcrypt.hash(data.password, 10);
        return userRepo.create({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            mobile: data.mobile,
            password_hash,
            role_id: data.role_id || 3,
        });
    }
    async loginUser(email, password_plain) {
        const user = await userRepo.findByEmail(email);
        if (!user || !(await bcrypt.compare(password_plain, user.password_hash))) {
            throw new Error("Invalid credentials");
        }
        const access_token = jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, { expiresIn: "1h" });
        return access_token;
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
        // Update password
        const password_hash = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: resetToken.user_id },
            data: { password_hash }
        });
        // Invalidate token
        await prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { used_at: new Date() }
        });
        // Optional: Invalidate active sessions for this user_id here.
    }
}
//# sourceMappingURL=auth.service.js.map