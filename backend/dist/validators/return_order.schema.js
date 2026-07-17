import { z } from "zod";
export const createReturnOrderSchema = z.object({
    order_id: z.number().int().positive(),
    reason: z.string().min(1),
});
//# sourceMappingURL=return_order.schema.js.map