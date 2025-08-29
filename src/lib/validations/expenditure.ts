import { z } from 'zod';

export const createExpenditureSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  image: z.instanceof(File, { message: 'Image file is required' })
    .refine((file) => file.size <= 200 * 1024, 'File size must be less than 200KB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type),
      'Only JPG and PNG files are allowed'
    ),
});

export const updateExpenditureSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  image: z.instanceof(File, { message: 'Image file is required' })
    .refine((file) => file.size <= 200 * 1024, 'File size must be less than 200KB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type),
      'Only JPG and PNG files are allowed'
    )
    .optional(),
});

export type CreateExpenditureFormData = z.infer<typeof createExpenditureSchema>;
export type UpdateExpenditureFormData = z.infer<typeof updateExpenditureSchema>;