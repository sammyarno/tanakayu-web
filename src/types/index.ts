export interface Announcement {
  id: number;
  title: string;
  content: string;
  categories: string[];
  createdAt: Date;
  createdBy: string;
}

export interface Category {
  label: string;
  value: string;
  icon?: React.ReactElement;
  bgColor?: string;
  textColor?: string;
}

export interface NewsEventComment {
  id: number;
  comment: string;
  createdAt: Date;
  createdBy: string;
}

export interface NewsEvent {
  id: number;
  title: string;
  type: 'news' | 'event';
  content: string;
  startDatetime: Date | null;
  endDatetime: Date | null;
  createdAt: Date;
  createdBy: string;
  comments: NewsEventComment[];
}

export interface Contact {
  id: number;
  name: string;
  role: string;
  category: 'pengurus' | 'satpam';
  image: string;
  phone: string;
}
