import { z } from "zod";
export declare const createMediaFileSchema: z.ZodObject<{
    file_name: z.ZodString;
    file_path: z.ZodString;
    file_type: z.ZodString;
    file_size: z.ZodNumber;
    folder: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=media_file.schema.d.ts.map