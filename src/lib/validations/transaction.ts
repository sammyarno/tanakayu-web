import { CATEGORY_OPTIONS } from '@/types/transaction';
import { z } from 'zod';

export const createTransactionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(val => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Amount must be a valid positive number'),
  category: z.enum(Object.keys(CATEGORY_OPTIONS) as [string, ...string[]], {
    message: 'Category is required',
  }),
  type: z.enum(['income', 'expense'], {
    message: 'Type is required',
  }),
});
