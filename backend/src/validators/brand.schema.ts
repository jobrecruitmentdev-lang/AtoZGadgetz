import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  logo: z.string().optional(),
  status: z.string().optional(),
});
