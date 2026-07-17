import { z } from "zod";

export const createMediaFileSchema = z.object({
  file_name: z.string().min(1),
  file_path: z.string().min(1),
  file_type: z.string().min(1),
  file_size: z.number().int().positive(),
  folder: z.string().min(1),
});
