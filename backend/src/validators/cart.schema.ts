import { z } from "zod";

export const addToCartSchema = z.object({
  product_id: z.number().int(),
  quantity: z.number().int().min(1).default(1),
});
