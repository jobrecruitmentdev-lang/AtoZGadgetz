import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  status: z.string().optional(),
  cj_keyword: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});
