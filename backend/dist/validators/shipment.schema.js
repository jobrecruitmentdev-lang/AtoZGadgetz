import { z } from "zod";
export const createShipmentSchema = z.object({
    order_id: z.number().int().positive(),
    courier_name: z.string().optional(),
    tracking_number: z.string().optional(),
    shipping_status: z.string().optional(),
});
//# sourceMappingURL=shipment.schema.js.map