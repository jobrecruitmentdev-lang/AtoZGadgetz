import { z } from "zod";
export declare const createBrandSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    logo: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=brand.schema.d.ts.map