import { z } from "zod";
export declare const createCategorySchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    cj_keyword: z.ZodOptional<z.ZodString>;
    seo_title: z.ZodOptional<z.ZodString>;
    seo_description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=category.schema.d.ts.map