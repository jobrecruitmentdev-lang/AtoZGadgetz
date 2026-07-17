import type { UserWithRoleAndPermissions } from '../middlewares/auth.middleware.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserWithRoleAndPermissions;
  }
}
