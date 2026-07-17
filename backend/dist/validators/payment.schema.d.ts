import { z } from "zod";
export declare const createPaymentSchema: z.ZodObject<{
    order_id: z.ZodNumber;
    payment_method: z.ZodString;
    transaction_id: z.ZodOptional<z.ZodString>;
    amount: z.ZodNumber;
    gateway_response: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=payment.schema.d.ts.map