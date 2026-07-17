import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    first_name: z.ZodString;
    last_name: z.ZodOptional<z.ZodString>;
    email: z.ZodString;
    mobile: z.ZodString;
    password: z.ZodString;
    role_id: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=auth.schema.d.ts.map