import type { ReactNode } from 'react';

export interface Category {
  id: string;
  label: string;
  code: string;
}

export interface CategoryDisplay {
  icon: ReactNode;
  bgColor: string;
  textColor: string;
}

export interface Comment {
  id: string;
  comment: string;
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface Contact {
  id: number;
  name: string;
  role: string;
  category: 'pengurus' | 'satpam';
  image: string;
  phone: string;
}
