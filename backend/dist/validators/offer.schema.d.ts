import { z } from "zod";
export declare const createOfferSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    offer_type: z.ZodString;
    discount_type: z.ZodEnum<{
        flat: "flat";
        percentage: "percentage";
    }>;
    discount_value: z.ZodNumber;
    minimum_order_amount: z.ZodOptional<z.ZodNumber>;
    maximum_discount: z.ZodOptional<z.ZodNumber>;
    start_date: z.ZodCoercedDate<unknown>;
    end_date: z.ZodCoercedDate<unknown>;
}, z.core.$strip>;
//# sourceMappingURL=offer.schema.d.ts.map