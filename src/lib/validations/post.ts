import { ANNOUNCEMENT_TYPE, EVENT_TYPE } from '@/types/post';
import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum([ANNOUNCEMENT_TYPE, EVENT_TYPE]),
  content: z.string().min(1, 'Content is required'),
  categories: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const editPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum([ANNOUNCEMENT_TYPE, EVENT_TYPE], { message: 'Type is required' }),
  content: z.string().min(1, 'Content is required'),
  categories: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
