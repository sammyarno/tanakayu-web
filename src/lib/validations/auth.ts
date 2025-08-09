import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50, 'Username too long'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password too long'),
});

export const registerSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50, 'Username too long'),
  full_name: z.string().min(1, 'Full name is required').max(100, 'Full name too long'),
  email: z.string().email('Invalid email format').max(100, 'Email too long'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password too long'),
  phone_number: z.string().min(1, 'Phone number is required').max(20, 'Phone number too long'),
  address: z.string().min(1, 'Address is required').max(200, 'Address too long'),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;