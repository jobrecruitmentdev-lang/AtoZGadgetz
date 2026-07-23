import { Request, Response } from 'express';
export declare const searchCjProducts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const huntCjProducts: (req: Request, res: Response) => Promise<void>;
export declare const getCjProductDetail: (req: Request, res: Response) => Promise<void>;
export declare const importCjProduct: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const placeCjOrder: (req: Request, res: Response) => Promise<void>;
export declare const cancelCjOrder: (req: Request, res: Response) => Promise<void>;
export declare const syncShipment: (req: Request, res: Response) => Promise<void>;
export declare const syncAllShipments: (_req: Request, res: Response) => Promise<void>;
export declare const autoImportCjProduct: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCjCategories: (_req: Request, res: Response) => Promise<void>;
export declare const syncCjCategories: (_req: Request, res: Response) => Promise<void>;
export declare const syncCjInventory: (req: Request, res: Response) => Promise<void>;
export declare const syncAllCjInventory: (_req: Request, res: Response) => Promise<void>;
export declare const handleCjWebhook: (req: Request, res: Response) => Promise<void>;
export declare const getCjHealth: (_req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=cj.controller.d.ts.map