import { z } from "zod";
export const createBannerSchema = z.object({
    title: z.string().min(1),
    image: z.string().min(1),
    mobile_image: z.string().optional(),
    redirect_url: z.string().optional(),
    position: z.string().min(1),
    sort_order: z.number().int().optional(),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
});
//# sourceMappingURL=banner.schema.js.map