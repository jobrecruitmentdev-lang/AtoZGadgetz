import { z } from "zod";
export declare const createShipmentSchema: z.ZodObject<{
    order_id: z.ZodNumber;
    courier_name: z.ZodOptional<z.ZodString>;
    tracking_number: z.ZodOptional<z.ZodString>;
    shipping_status: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=shipment.schema.d.ts.map