import { z } from "zod";

export const createOrderSchema = z.object({
  address_id: z.number().int().optional(),
  coupon_id: z.number().int().nullable().optional(),
  
  // Guest / New User details
  guest: z.object({
    firstName: z.string().min(1),
    lastName: z.string().optional(),
    email: z.string().email(),
    phone: z.string().min(1)
  }).optional(),

  // Raw address payload if address_id isn't provided
  address: z.object({
    address_line1: z.string().min(1),
    address_line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postal_code: z.string().min(1),
    country: z.string().min(1),
  }).optional(),

  // Items payload if cart isn't used
  items: z.array(z.object({
    product_id: z.number().int(),
    quantity: z.number().int(),
    price: z.number().or(z.string()),
    name: z.string().optional()
  })).optional()
});
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ]),
});
