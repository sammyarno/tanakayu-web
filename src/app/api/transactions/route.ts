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
    const requestedMonth = searchParams.get('month');

    // `month=latest` lets the client fetch the newest month immediately instead
    // of waiting on /date-range to resolve first (that was a request waterfall).
    let monthFilter = requestedMonth;
    if (requestedMonth === 'latest') {
      const { data: newest } = await supabase
        .from('transactions')
        .select('date')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Parse the YYYY-MM-DD string directly; `new Date(...)` would treat it as
      // UTC midnight and shift the month in negative-offset timezones.
      monthFilter = newest?.date ? `${newest.date.slice(5, 7)}${newest.date.slice(0, 4)}` : null;
    }

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
    let balanceStart = 0;
    let balance = 0;

    if (monthFilter && monthFilter.length === 6) {
      const month = parseInt(monthFilter.substring(0, 2), 10);
      const year = parseInt(monthFilter.substring(2), 10);

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Fetch current month transactions and prior balance in parallel
      const [txResult, balanceResult] = await Promise.all([
        supabase
          .from('transactions')
          .select('id, title, amount, type, category, description, date, created_at, created_by')
          .gte('date', startDateStr)
          .lte('date', endDateStr)
          .order('date', { ascending: false }),
        supabase.rpc('get_balance_before_date', { target_date: startDateStr }),
      ]);

      if (txResult.error) {
        response.error = txResult.error.message;
        return Response.json(response, { status: 500 });
      }

      const currentMonthTxs = txResult.data ?? [];
      const currentIncome = currentMonthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const currentExpenses = currentMonthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      balanceStart = Number(balanceResult.data ?? 0);
      balance = balanceStart + currentIncome - currentExpenses;

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
      response.data = { month: monthFilter, balanceStart, balance, transactions: [] };
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
      month: monthFilter,
      balanceStart,
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

    if (user!.role !== 'SUPERADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

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
