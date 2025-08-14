import { CLUSTER_LIST } from '@/data/clusters';
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50, 'Username too long'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password too long'),
});

export const registerSchema = z.object({
  username: z.string().min(1, 'Username is required').min(6, 'Username must be at least 6 characters'),
  full_name: z.string().min(1, 'Full Name is required').min(6, 'Full Name must be at least 6 characters'),
  cluster: z.enum(CLUSTER_LIST, { message: 'Cluster must be selected' }),
  address: z.string().min(1, 'Address is required'),
  password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
  email: z.email('Please enter a valid email'),
  phone_number: z
    .string()
    .min(1, 'Phone Number is required')
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, 'Invalid Indonesian phone number'),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
