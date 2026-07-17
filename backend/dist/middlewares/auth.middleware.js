import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";
import { config } from "../config/env.js";
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
export const authorizeRBAC = (requiredPermissions) => {
    return (req, res, next) => {
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        // Bypass RBAC for SuperAdmin and Admin
        if (authReq.user.role_id === 1 || authReq.user.role_id === 2) {
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
    if (!authReq.user || (authReq.user.role_id !== 1 && authReq.user.role_id !== 2)) {
        return res
            .status(403)
            .json({ success: false, message: "Forbidden: Admins only" });
    }
    next();
};
//# sourceMappingURL=auth.middleware.js.map