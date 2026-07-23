import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";
import { config } from "../config/env.js";
const isAdminLikeRole = (user) => {
    if (!user)
        return false;
    if (user.role_id === 1 || user.role_id === 2)
        return true;
    const roleName = String(user.role?.role_name || "").trim().toLowerCase();
    return roleName === "admin" || roleName === "super admin" || roleName === "superadmin";
};
export const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        if (!token)
            return res
                .status(401)
                .json({ success: false, message: "Invalid token format" });
        jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] }, async (err, decoded) => {
            if (err) {
                return res
                    .status(401)
                    .json({ success: false, message: "Invalid token" });
            }
            const user = await prisma.user.findUnique({
                where: { id: decoded.sub },
                include: {
                    role: { include: { permissions: { include: { permission: true } } } },
                },
            });
            if (!user) {
                return res
                    .status(401)
                    .json({ success: false, message: "User not found" });
            }
            req.user = user;
            next();
        });
    }
    else {
        res
            .status(401)
            .json({ success: false, message: "Authorization header missing" });
    }
};
export const optionalAuthenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        if (!token)
            return next();
        jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] }, async (err, decoded) => {
            if (err)
                return next();
            const user = await prisma.user.findUnique({
                where: { id: decoded.sub },
                include: {
                    role: { include: { permissions: { include: { permission: true } } } },
                },
            });
            if (user) {
                req.user = user;
            }
            next();
        });
    }
    else {
        next();
    }
};
export const authorizeRBAC = (requiredPermissions) => {
    return (req, res, next) => {
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        // Bypass permission-string checks for admin-level roles.
        if (isAdminLikeRole(authReq.user)) {
            return next();
        }
        const userPermissions = authReq.user.role.permissions.map((rp) => rp.permission.permission_name);
        const hasPermission = requiredPermissions.every((rp) => userPermissions.includes(rp));
        if (!hasPermission) {
            return res
                .status(403)
                .json({
                success: false,
                message: "Forbidden: Insufficient permissions",
            });
        }
        next();
    };
};
// Mirrors FastAPI's require_admin_or_super_admin — role check, not permission-string
// check, since several admin-only actions (order/shipment/return management) aren't
// covered by a dedicated entry in the permissions table.
export const requireAdminOrSuperAdmin = (req, res, next) => {
    const authReq = req;
    if (!isAdminLikeRole(authReq.user)) {
        return res
            .status(403)
            .json({ success: false, message: "Forbidden: Admins only" });
    }
    next();
};
//# sourceMappingURL=auth.middleware.js.map