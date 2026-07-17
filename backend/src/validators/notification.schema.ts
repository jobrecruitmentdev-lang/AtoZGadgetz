import { z } from "zod";

export const createNotificationSchema = z.object({
  user_id: z.number().int().positive(),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.string().min(1),
});
