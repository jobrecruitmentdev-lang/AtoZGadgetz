import { z } from "zod";
export declare const createAnalyticsEventSchema: z.ZodObject<{
    session_id: z.ZodOptional<z.ZodString>;
    event_name: z.ZodString;
    event_data: z.ZodOptional<z.ZodString>;
    page_url: z.ZodOptional<z.ZodString>;
    referrer: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=analytics_event.schema.d.ts.map