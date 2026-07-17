import { Request, Response } from 'express';
export declare const getAllPayments: (_req: Request, res: Response) => Promise<void>;
export declare const createPayment: (req: Request, res: Response) => Promise<void>;
export declare const razorpayCreateOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const razorpayVerify: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=payment.controller.d.ts.map