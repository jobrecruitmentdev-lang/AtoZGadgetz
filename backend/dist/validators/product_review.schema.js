import { z } from "zod";
export const createProductReviewSchema = z.object({
    product_id: z.number().int().positive(),
    rating: z.number().int().min(1).max(5),
    review: z.string().optional(),
});
//# sourceMappingURL=product_review.schema.js.map