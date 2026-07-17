import { z } from "zod";
export declare const createSubcategorySchema: z.ZodObject<{
    category_id: z.ZodNumber;
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=subcategory.schema.d.ts.map