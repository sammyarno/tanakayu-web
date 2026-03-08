import type { Category, Comment } from '@/types';

export const PENGUMUMAN_TYPE = 'pengumuman' as const;
export const ACARA_TYPE = 'acara' as const;
export type PostType = typeof PENGUMUMAN_TYPE | typeof ACARA_TYPE;

export const POST_TYPES = [
  { value: PENGUMUMAN_TYPE, label: 'Pengumuman' },
  { value: ACARA_TYPE, label: 'Acara' },
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

export interface PostWithComments extends Post {
  comments: Comment[];
}

export interface NearestEvent {
  id: string;
  title: string;
  type: string;
  content: string;
  start: string;
  end: string;
}
