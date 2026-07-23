import { Request, Response } from "express";
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const me: (req: any, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const logout: (req: Request, res: Response) => Promise<void>;
export declare const forgotPassword: (req: Request, res: Response) => Promise<void>;
export declare const resetPassword: (req: Request, res: Response) => Promise<void>;
export declare const sendMobileOtp: (req: Request, res: Response) => Promise<void>;
export declare const verifyMobileOtp: (req: Request, res: Response) => Promise<void>;
export declare const requestMagicLink: (req: Request, res: Response) => Promise<void>;
export declare const verifyMagicLink: (req: Request, res: Response) => Promise<void>;
export declare const completeRegistration: (req: Request, res: Response) => Promise<void>;
export declare const completeProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.controller.d.ts.map