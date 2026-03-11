import type { Category } from '@/types';

export const ANNOUNCEMENT_TYPE = 'announcement' as const;
export const EVENT_TYPE = 'event' as const;
export type PostType = typeof ANNOUNCEMENT_TYPE | typeof EVENT_TYPE;

export const POST_TYPES = [
  { value: ANNOUNCEMENT_TYPE, label: 'Announcement' },
  { value: EVENT_TYPE, label: 'Event' },
] as const;

export interface Post {
  id: string;
  title: string;
  content: string;
  type: PostType;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  createdBy: string;
  categories: Category[];
}

export interface PostWithVotes extends Post {
  upvotes: number;
  downvotes: number;
  userVote: 'upvote' | 'downvote' | null;
}

export interface NearestEvent {
  id: string;
  title: string;
  type: string;
  content: string;
  start: string;
  end: string;
}
