import type { ReactNode } from 'react';

export interface Category {
  id: string;
  label: string;
  code: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
  categories: Category[];
}

export interface CategoryDisplay {
  icon: ReactNode;
  bgColor: string;
  textColor: string;
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
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
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

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: string;
  category: string;
  description: string | null;
  date: string;
  createdAt: string;
  createdBy: string;
}

export interface TransactionsByDate {
  date: string;
  details: Transaction[];
}

export interface TransactionsResult {
  balance: number;
  transactions: TransactionsByDate[];
}

interface UploadTransactionResultSummary {
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
}

export interface UploadTransactionResult extends TransactionsResult {
  summary: UploadTransactionResultSummary;
}
