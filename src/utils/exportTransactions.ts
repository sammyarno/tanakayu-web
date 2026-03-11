import type { TransactionsResult } from '@/types/transaction';

const formatAmount = (amount: number, type: string): string => {
  const formatted = amount.toLocaleString('en-US');
  return type === 'income' ? `${formatted} CR` : `${formatted} DB`;
};

export const exportTransactionsToExcel = async (data: TransactionsResult, periodLabel: string, periodValue?: string) => {
  const XLSX = await import('xlsx');

  const rows: (string | number)[][] = [];

  // Column headers matching the upload format
  rows.push(['Tanggal Transaksi', 'Keterangan', 'Jumlah', 'Cek']);

  // Data rows
  for (const dayGroup of data.transactions) {
    for (const tx of dayGroup.details) {
      rows.push([tx.date, tx.title, formatAmount(tx.amount, tx.type), tx.description ?? '']);
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 16 }, // Tanggal Transaksi
    { wch: 30 }, // Keterangan
    { wch: 18 }, // Jumlah
    { wch: 30 }, // Cek
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');

  const filename = periodValue ? `Transaction_Report_${periodValue}.xlsx` : 'Transaction_Report_All.xlsx';
  XLSX.writeFile(wb, filename);
};
