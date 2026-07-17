import { z } from "zod";

export const createAddressSchema = z.object({
  address_line1: z.string().min(1),
  address_line2: z.string().optional().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  postal_code: z.string().min(1),
  country: z.string().min(1),
  is_default: z.boolean().optional(),
});
