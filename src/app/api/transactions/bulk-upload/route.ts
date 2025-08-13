import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';

interface BulkTransactionRequest {
  transactions: Array<{
    amount: number;
    category: string;
    date: string;
    description: string;
    title: string;
    type: 'income' | 'expense';
  }>;
  actor: string;
}

function validateTransaction(transaction: any): string[] {
  const errors: string[] = [];

  // Required fields validation
  if (!transaction.amount && transaction.amount !== 0) {
    errors.push('Amount is required');
  }
  if (!transaction.category?.trim()) {
    errors.push('Category is required');
  }
  if (!transaction.date) {
    errors.push('Date is required');
  }
  if (!transaction.description?.trim()) {
    errors.push('Description is required');
  }
  if (!transaction.title?.trim()) {
    errors.push('Title is required');
  }
  if (!transaction.type) {
    errors.push('Type is required');
  }

  // Data type validations
  if (transaction.amount !== undefined) {
    const amount = Number(transaction.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push('Amount must be a positive number');
    }
  }

  if (transaction.type && !['income', 'expense'].includes(transaction.type)) {
    errors.push('Type must be either "income" or "expense"');
  }

  if (transaction.date) {
    const date = new Date(transaction.date);
    if (isNaN(date.getTime())) {
      errors.push('Date must be a valid date');
    } else if (date > new Date()) {
      errors.push('Date cannot be in the future');
    }
  }

  return errors;
}

export async function POST(request: NextRequest) {
  try {
    const body: BulkTransactionRequest = await request.json();

    if (!body.transactions || !Array.isArray(body.transactions)) {
      return Response.json({ error: 'Transactions array is required' }, { status: 400 });
    }

    if (!body.actor?.trim()) {
      return Response.json({ error: 'Actor is required' }, { status: 400 });
    }

    if (body.transactions.length === 0) {
      return Response.json({ error: 'At least one transaction is required' }, { status: 400 });
    }

    // Validate all transactions
    const validationErrors: string[] = [];
    body.transactions.forEach((transaction, index) => {
      const errors = validateTransaction(transaction);
      if (errors.length > 0) {
        validationErrors.push(`Transaction ${index + 1}: ${errors.join(', ')}`);
      }
    });

    if (validationErrors.length > 0) {
      return Response.json({ error: `Validation failed: ${validationErrors.join('; ')}` }, { status: 400 });
    }

    // Prepare transactions for insert
    const transactionsToInsert = body.transactions.map(transaction => ({
      ...transaction,
      created_by: body.actor,
      amount: Number(transaction.amount),
    }));

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);
    const { data, error } = await supabase.from('transactions').insert(transactionsToInsert).select();

    if (error) {
      console.error('Supabase error:', error);
      return Response.json({ error: `Failed to insert transactions: ${error.message}` }, { status: 500 });
    }

    return Response.json({
      success: true,
      count: data?.length || 0,
      transactions: data,
    });
  } catch (error) {
    console.error('Bulk transaction creation error:', error);
    return Response.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
