import { z } from "zod";

export const createSubcategorySchema = z.object({
  category_id: z.number().int(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  status: z.string().optional(),
});
