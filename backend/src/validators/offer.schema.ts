import { z } from "zod";

export const createOfferSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  offer_type: z.string().min(1),
  discount_type: z.enum(["percentage", "flat"]),
  discount_value: z.number().positive(),
  minimum_order_amount: z.number().min(0).optional(),
  maximum_discount: z.number().positive().optional(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
});
