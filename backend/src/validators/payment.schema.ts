import { z } from "zod";

export const createPaymentSchema = z.object({
  order_id: z.number().int().positive(),
  payment_method: z.string().min(1),
  transaction_id: z.string().optional(),
  amount: z.number().positive(),
  gateway_response: z.string().optional(),
});
