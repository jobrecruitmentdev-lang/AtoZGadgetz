import { Request, Response } from "express";
export declare const getAllOrders: (req: Request, res: Response) => Promise<void>;
export declare const getMyOrders: (req: Request, res: Response) => Promise<void>;
export declare const getOrderById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const placeOrder: (req: Request, res: Response) => Promise<void>;
export declare const updateOrderStatus: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=order.controller.d.ts.map