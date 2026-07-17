import { z } from "zod";
export const createInventorySchema = z.object({
    product_id: z.number().int().positive(),
    variant_id: z.number().int().positive().optional(),
    stock_quantity: z.number().int().min(0),
    reserved_quantity: z.number().int().min(0).optional(),
});
//# sourceMappingURL=inventory.schema.js.map