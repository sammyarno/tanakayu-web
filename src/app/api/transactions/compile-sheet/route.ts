import { NextRequest } from 'next/server';

import type { UploadTransactionResult } from '@/types';
import { getNowDate, parseExcelDate } from '@/utils/date';
import * as XLSX from 'xlsx';

const allowedTypes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'application/vnd.ms-excel.sheet.binary.macroEnabled.12', // .xlsb
  'text/csv', // .csv
  'application/csv', // .csv (alternative MIME type)
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'Invalid file type. Please upload an Excel or CSV file.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();

    // parse
    const workbook = XLSX.read(arrayBuffer);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // convert to json
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (!jsonData || jsonData.length < 2) {
      return Response.json({ error: 'Excel file is empty' }, { status: 400 });
    }

    const headers = jsonData[0] as string[];

    const dateColumnIndex = headers.findIndex(h => h && h.toLowerCase().includes('tanggal transaksi'));
    const titleColumnIndex = headers.findIndex(h => h && h.toLowerCase().includes('keterangan'));
    const amountColumnIndex = headers.findIndex(h => h && h.toLowerCase().includes('jumlah'));
    const descriptionColumnIndex = headers.findIndex(h => h && h.toLowerCase().includes('cek'));

    if (
      dateColumnIndex === -1 ||
      titleColumnIndex === -1 ||
      descriptionColumnIndex === -1 ||
      amountColumnIndex === -1
    ) {
      return Response.json(
        {
          error:
            'Required columns not found. Please ensure your Excel file has "Tanggal Transaksi", "Keterangan", and "Jumlah" columns.',
        },
        { status: 400 }
      );
    }

    const transactions = [];
    const dataRows = jsonData.slice(1) as any[][];

    for (const row of dataRows) {
      if (!row || row.length === 0 || !row[dateColumnIndex] || !row[amountColumnIndex]) {
        continue;
      }

      try {
        const date = parseExcelDate(row[dateColumnIndex]);
        if (!date) {
          console.warn(`Invalid date format: ${row[dateColumnIndex]} | ${row[dateColumnIndex]}`);
          continue;
        }

        const title = row[titleColumnIndex]?.toString() || '';
        const description = row[descriptionColumnIndex]?.toString() || '';
        const amountString = row[amountColumnIndex]?.toString() || '';
        const amountParts = amountString.trim().split(' ');

        if (amountParts.length < 2) {
          console.warn(`Invalid amount format: ${amountString}`);
          continue;
        }

        const amountStr = amountParts[0].replace(/,/g, '');
        const typeCode = amountParts[1].toUpperCase();

        const amount = parseFloat(amountStr);
        if (isNaN(amount)) {
          console.warn(`Invalid amount value: ${amountStr}`);
          continue;
        }

        let type: string;
        if (typeCode === 'CR') {
          type = 'income';
        } else if (typeCode === 'DB') {
          type = 'expense';
        } else {
          console.warn(`Unknown type code: ${typeCode}`);
          continue;
        }

        transactions.push({
          id: `upload-${getNowDate()}-${Math.random().toString(36).substr(2, 9)}`,
          title,
          description,
          amount,
          type,
          category: 'upload sheet',
          date,
          createdAt: getNowDate(),
          createdBy: 'system',
        });
      } catch (error) {
        console.warn(`Error processing row:`, row, error);
        continue;
      }
    }

    if (transactions.length === 0) {
      return Response.json({ error: 'No valid transactions found in the Excel file' }, { status: 400 });
    }

    const balance = transactions.reduce((acc, transaction) => {
      return transaction.type === 'income' ? acc + transaction.amount : acc - transaction.amount;
    }, 0);

    const transactionsByDateMap = transactions.reduce(
      (acc, transaction) => {
        const date = transaction.date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(transaction);
        return acc;
      },
      {} as Record<string, typeof transactions>
    );

    const transactionsByDate = Object.entries(transactionsByDateMap).map(([date, details]) => ({
      date,
      details,
    }));

    const res: UploadTransactionResult = {
      balance,
      transactions: transactionsByDate,
      summary: {
        totalTransactions: transactions.length,
        totalIncome: transactions.filter(t => t.type === 'income').length,
        totalExpense: transactions.filter(t => t.type === 'expense').length,
      },
    };

    return Response.json(res);
  } catch (error) {
    console.error('Error processing Excel file:', error);
    return Response.json({ error: 'Internal server error while processing Excel file' }, { status: 500 });
  }
}
