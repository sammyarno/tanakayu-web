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

export interface Contact {
  id: number;
  name: string;
  role: string;
  category: 'pengurus' | 'satpam';
  image: string;
  phone: string;
}
