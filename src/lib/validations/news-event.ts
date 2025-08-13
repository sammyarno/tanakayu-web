import { EVENT_TYPE, NEWS_TYPE } from '@/types/news-event';
import z from 'zod';

export const createNewsEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum([NEWS_TYPE, EVENT_TYPE]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
});

export const editNewsEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum([NEWS_TYPE, EVENT_TYPE], { message: 'Type is required' }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
