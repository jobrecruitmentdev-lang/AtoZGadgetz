import { z } from "zod";
export declare const createOrderSchema: z.ZodObject<{
    address_id: z.ZodNumber;
    coupon_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        cancelled: "cancelled";
        delivered: "delivered";
        pending: "pending";
        processing: "processing";
        returned: "returned";
        shipped: "shipped";
    }>;
}, z.core.$strip>;
//# sourceMappingURL=order.schema.d.ts.map