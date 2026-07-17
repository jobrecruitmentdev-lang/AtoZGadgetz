import { z } from "zod";
export declare const createAddressSchema: z.ZodObject<{
    address_line1: z.ZodString;
    address_line2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    city: z.ZodString;
    state: z.ZodString;
    postal_code: z.ZodString;
    country: z.ZodString;
    is_default: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
//# sourceMappingURL=address.schema.d.ts.map