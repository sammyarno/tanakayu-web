import type { Category } from '.';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
  categories: Category[];
}
