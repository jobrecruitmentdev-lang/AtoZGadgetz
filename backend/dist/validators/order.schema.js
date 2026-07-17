import { z } from "zod";
export const createOrderSchema = z.object({
    address_id: z.number().int(),
    coupon_id: z.number().int().nullable().optional(),
});
export const updateOrderStatusSchema = z.object({
    status: z.enum([
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
    ]),
});
//# sourceMappingURL=order.schema.js.map