import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import { verifyAuth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import type { FetchResponse, SimpleResponse } from '@/types/fetch';
import type { TransactionsResult } from '@/types/transaction';

export async function GET(request: NextRequest) {
  const response: FetchResponse<TransactionsResult> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { searchParams } = new URL(request.url);
    const monthFilter = searchParams.get('month');

    let transformedTransactions: {
      id: string;
      title: string;
      amount: number;
      type: string;
      category: string;
      description: string | null;
      date: string;
      createdAt: string;
      createdBy: string;
    }[];
    let balance = 0;

    if (monthFilter && monthFilter.length === 6) {
      const month = parseInt(monthFilter.substring(0, 2), 10);
      const year = parseInt(monthFilter.substring(2), 10);

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Single query: all transactions up to end of current month
      const { data: allTransactions, error } = await supabase
        .from('transactions')
        .select('id, title, amount, type, category, description, date, created_at, created_by')
        .lte('date', endDateStr)
        .order('date', { ascending: false });

      if (error) {
        response.error = error.message;
        return Response.json(response, { status: 500 });
      }

      const all = allTransactions ?? [];
      const currentMonthTxs = all.filter(t => t.date >= startDateStr);
      const prevTxs = all.filter(t => t.date < startDateStr);

      const lastMonthBalance = prevTxs.reduce((acc, t) =>
        t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
      const currentIncome = currentMonthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const currentExpenses = currentMonthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      balance = lastMonthBalance + currentIncome - currentExpenses;

      transformedTransactions = currentMonthTxs.map(t => ({
        id: t.id,
        title: t.title,
        amount: t.amount,
        type: t.type,
        category: t.category,
        description: t.description,
        date: t.date,
        createdAt: t.created_at,
        createdBy: t.created_by,
      }));
    } else {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('id, title, amount, type, category, description, date, created_at, created_by')
        .order('date', { ascending: false });

      if (error) {
        response.error = error.message;
        return Response.json(response, { status: 500 });
      }

      transformedTransactions = (transactions ?? []).map(t => ({
        id: t.id,
        title: t.title,
        amount: t.amount,
        type: t.type,
        category: t.category,
        description: t.description,
        date: t.date,
        createdAt: t.created_at,
        createdBy: t.created_by,
      }));

      balance = transformedTransactions.reduce((acc, t) =>
        t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
    }

    if (transformedTransactions.length === 0) {
      response.data = { balance: 0, transactions: [] };
      return Response.json(response, { status: 200 });
    }

    // Group transactions by date
    const transactionsByDate = transformedTransactions.reduce(
      (acc, transaction) => {
        const date = transaction.date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(transaction);
        return acc;
      },
      {} as Record<string, typeof transformedTransactions>
    );

    response.data = {
      balance,
      transactions: Object.entries(transactionsByDate).map(([date, details]) => ({
        date,
        details,
      })),
    };
    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const response: FetchResponse<SimpleResponse> = {};

  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError) return authError;

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);
    const body = await request.json();

    const { title, description, amount, category, type, date } = body;
    const actor = user!.username;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        title,
        description: description || null,
        amount,
        category,
        type,
        date,
        created_by: actor,
      })
      .select('id');

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    await logAudit(supabase, {
      action: 'create',
      entityType: 'transaction',
      entityId: data[0].id,
      actor,
      metadata: { title, type, amount, category },
    });

    response.data = data[0];
    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
