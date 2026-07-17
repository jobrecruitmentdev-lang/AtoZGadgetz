import { z } from "zod";

export const createAuditLogSchema = z.object({
  module: z.string().min(1),
  action: z.string().min(1),
  description: z.string().min(1),
  old_data: z.string().optional(),
  new_data: z.string().optional(),
});
