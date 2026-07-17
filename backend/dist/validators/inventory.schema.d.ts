import { z } from "zod";
export declare const createInventorySchema: z.ZodObject<{
    product_id: z.ZodNumber;
    variant_id: z.ZodOptional<z.ZodNumber>;
    stock_quantity: z.ZodNumber;
    reserved_quantity: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
//# sourceMappingURL=inventory.schema.d.ts.map