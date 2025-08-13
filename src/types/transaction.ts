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

export const CATEGORY_OPTIONS = {
  'iuran warga': 'income',
  'kegiatan sosial / keagamaan': 'expense',
  'perawatan lingkungan': 'expense',
  'uang operasional': 'expense',
  donasi: 'income',
  'lain lain': null, // user can choose type
} as const;

export type CategoryKey = keyof typeof CATEGORY_OPTIONS;

export interface BulkCreateTransactionsParamsTransaction {
  amount: number;
  category: string;
  date: string;
  description: string;
  title: string;
  type: 'income' | 'expense';
}

export interface BulkCreateTransactionsParams {
  transactions: BulkCreateTransactionsParamsTransaction[];
  actor: string;
}

export interface BulkCreateTransactionsResponse {
  success: boolean;
  count: number;
  transactions: Transaction[];
}
