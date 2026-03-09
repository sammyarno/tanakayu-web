import { CLUSTER_LIST } from '@/data/clusters';
import z from 'zod';

export const updateProfileSchema = z.object({
  display_name: z.string().min(1, 'Display Name is required').min(6, 'Display Name must be at least 6 characters'),
  cluster: z.enum(CLUSTER_LIST, { message: 'Cluster must be selected' }),
  address: z.string().min(1, 'Address is required'),
  email: z.email('Please enter a valid email'),
  phone: z
    .string()
    .min(1, 'Phone Number is required')
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, 'Invalid Indonesian phone number'),
});

export const changePasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
