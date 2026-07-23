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
export declare const magicLinkRequestSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export declare const magicLinkVerifySchema: z.ZodObject<{
    token: z.ZodString;
}, z.core.$strip>;
export declare const completeRegistrationSchema: z.ZodObject<{
    activation_token: z.ZodString;
    first_name: z.ZodString;
    last_name: z.ZodString;
    mobile: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const completeProfileSchema: z.ZodObject<{
    first_name: z.ZodString;
    last_name: z.ZodString;
    mobile: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=auth.schema.d.ts.map