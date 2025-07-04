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

export interface NewsEvent {
  id: string;
  title: string;
  type: string;
  content: string;
  startDate: string | null;
  endDate: string | null;
}

export interface Comment {
  id: string;
  comment: string;
  createdAt: string;
  createdBy: string;
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

export interface Contact {
  id: number;
  name: string;
  role: string;
  category: 'pengurus' | 'satpam';
  image: string;
  phone: string;
}
