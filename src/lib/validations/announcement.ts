import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
});

export const editAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
});
