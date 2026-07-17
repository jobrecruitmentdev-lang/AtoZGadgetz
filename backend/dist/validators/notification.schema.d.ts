import { z } from "zod";
export declare const createNotificationSchema: z.ZodObject<{
    user_id: z.ZodNumber;
    title: z.ZodString;
    message: z.ZodString;
    type: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=notification.schema.d.ts.map