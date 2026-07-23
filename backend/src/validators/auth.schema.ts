import { z } from "zod";

export const registerSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().optional(),
  email: z.string().email(),
  mobile: z.string().min(10),
  password: z.string().min(6),
  role_id: z.number().int().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const magicLinkRequestSchema = z.object({
  email: z.string().email(),
});

export const magicLinkVerifySchema = z.object({
  token: z.string().min(32),
});

export const completeRegistrationSchema = z.object({
  activation_token: z.string().min(20),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  mobile: z.string().min(8),
  password: z.string().min(6),
});

export const completeProfileSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  mobile: z.string().min(8),
});
