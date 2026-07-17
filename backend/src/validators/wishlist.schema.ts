import { z } from "zod";

export const addToWishlistSchema = z.object({
  product_id: z.number().int().positive(),
});
