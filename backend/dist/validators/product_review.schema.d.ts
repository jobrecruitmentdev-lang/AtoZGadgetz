import { z } from "zod";
export declare const createProductReviewSchema: z.ZodObject<{
    product_id: z.ZodNumber;
    rating: z.ZodNumber;
    review: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=product_review.schema.d.ts.map