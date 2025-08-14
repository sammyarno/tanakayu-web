import { CLUSTER_LIST } from '@/data/clusters';
import z from 'zod';

export const editProfileSchema = z
  .object({
    username: z.string().min(1, 'Username is required').min(6, 'Username must be at least 6 characters'),
    fullName: z.string().min(1, 'Full Name is required').min(6, 'Full Name must be at least 6 characters'),
    cluster: z.enum(CLUSTER_LIST, { message: 'Cluster must be selected' }),
    address: z.string().min(1, 'Address is required'),
    password: z
      .string()
      .optional()
      .refine(val => !val || val.length >= 8, { message: 'Password must be at least 8 characters' }),
    email: z.string().email('Please enter a valid email'),
    phoneNumber: z
      .string()
      .min(1, 'Phone Number is required')
      .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, 'Invalid Indonesian phone number'),
    confirmPassword: z.string().optional(),
  })
  .refine(
    data => {
      if (data.password && data.password !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }
  );
