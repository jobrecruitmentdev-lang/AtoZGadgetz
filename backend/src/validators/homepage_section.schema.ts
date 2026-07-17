import { z } from "zod";

export const createHomepageSectionSchema = z.object({
  title: z.string().min(1),
  section_type: z.string().min(1),
  sort_order: z.number().int().optional(),
});
