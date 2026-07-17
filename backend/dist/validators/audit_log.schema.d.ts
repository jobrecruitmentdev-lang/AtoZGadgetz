import { z } from "zod";
export declare const createAuditLogSchema: z.ZodObject<{
    module: z.ZodString;
    action: z.ZodString;
    description: z.ZodString;
    old_data: z.ZodOptional<z.ZodString>;
    new_data: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=audit_log.schema.d.ts.map