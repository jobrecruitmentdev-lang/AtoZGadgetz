import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
export type UserWithRoleAndPermissions = Prisma.UserGetPayload<{
    include: {
        role: {
            include: {
                permissions: {
                    include: {
                        permission: true;
                    };
                };
            };
        };
    };
}>;
export interface AuthRequest extends Request {
    user: UserWithRoleAndPermissions;
}
export declare const authenticateJWT: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const optionalAuthenticateJWT: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeRBAC: (requiredPermissions: string[]) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireAdminOrSuperAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.middleware.d.ts.map