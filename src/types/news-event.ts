import type { Comment } from '@/types';

export const NEWS_TYPE = 'news' as const;
export const EVENT_TYPE = 'event' as const;
export type NewsEventType = typeof NEWS_TYPE | typeof EVENT_TYPE;

export const NEWS_EVENT_TYPES = [
  { value: NEWS_TYPE, label: 'Berita' },
  { value: EVENT_TYPE, label: 'Acara' },
] as const;

export interface NewsEvent {
  id: string;
  title: string;
  type: string;
  content: string;
  startDate: string | null;
  endDate: string | null;
}

export interface NearestEvent {
  id: string;
  title: string;
  type: string;
  content: string;
  start: string;
  end: string;
}

export interface NewsEventWithComment {
  id: string;
  title: string;
  type: string;
  content: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  createdBy: string;
  comments: Comment[];
}
