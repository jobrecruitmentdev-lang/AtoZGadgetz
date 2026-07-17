import { z } from "zod";
export declare const createBannerSchema: z.ZodObject<{
    title: z.ZodString;
    image: z.ZodString;
    mobile_image: z.ZodOptional<z.ZodString>;
    redirect_url: z.ZodOptional<z.ZodString>;
    position: z.ZodString;
    sort_order: z.ZodOptional<z.ZodNumber>;
    start_date: z.ZodCoercedDate<unknown>;
    end_date: z.ZodCoercedDate<unknown>;
}, z.core.$strip>;
//# sourceMappingURL=banner.schema.d.ts.map