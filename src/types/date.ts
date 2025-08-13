export interface DateRangeResponse {
  minDate: string | null;
  maxDate: string | null;
  hasTransactions: boolean;
}

export interface MonthOption {
  value: string; // Format: MMYYYY (e.g., "072025")
  label: string; // Format: "Month YYYY" (e.g., "July 2025")
}
