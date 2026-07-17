import { z } from "zod";
export const createAnalyticsEventSchema = z.object({
    session_id: z.string().optional(),
    event_name: z.string().min(1),
    event_data: z.string().optional(),
    page_url: z.string().optional(),
    referrer: z.string().optional(),
});
//# sourceMappingURL=analytics_event.schema.js.map