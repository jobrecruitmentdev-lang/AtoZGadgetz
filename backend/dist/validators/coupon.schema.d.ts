import { z } from "zod";
export declare const createCouponSchema: z.ZodObject<{
    code: z.ZodString;
    discount_type: z.ZodEnum<{
        flat: "flat";
        percentage: "percentage";
    }>;
    discount_value: z.ZodNumber;
    minimum_order_amount: z.ZodOptional<z.ZodNumber>;
    maximum_discount: z.ZodOptional<z.ZodNumber>;
    start_date: z.ZodCoercedDate<unknown>;
    end_date: z.ZodCoercedDate<unknown>;
    usage_limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
//# sourceMappingURL=coupon.schema.d.ts.map