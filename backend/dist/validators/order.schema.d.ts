import { z } from "zod";
export declare const createOrderSchema: z.ZodObject<{
    address_id: z.ZodOptional<z.ZodNumber>;
    coupon_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    guest: z.ZodOptional<z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodOptional<z.ZodString>;
        email: z.ZodString;
        phone: z.ZodString;
    }, z.core.$strip>>;
    address: z.ZodOptional<z.ZodObject<{
        address_line1: z.ZodString;
        address_line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        postal_code: z.ZodString;
        country: z.ZodString;
    }, z.core.$strip>>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        product_id: z.ZodNumber;
        quantity: z.ZodNumber;
        price: z.ZodUnion<[z.ZodNumber, z.ZodString]>;
        name: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        cancelled: "cancelled";
        delivered: "delivered";
        pending: "pending";
        processing: "processing";
        returned: "returned";
        shipped: "shipped";
    }>;
}, z.core.$strip>;
//# sourceMappingURL=order.schema.d.ts.map