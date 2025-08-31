import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import type { FetchResponse, SimpleResponse } from '@/types/fetch';
import type { TransactionsResult } from '@/types/transaction';

export async function GET(request: NextRequest) {
  const response: FetchResponse<TransactionsResult> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { searchParams } = new URL(request.url);
    const monthFilter = searchParams.get('month');

    let query = supabase
      .from('transactions')
      .select('id, title, amount, type, category, description, date, created_at, created_by')
      .order('date', { ascending: false });

    // Apply month filter if provided
    if (monthFilter && monthFilter.length === 6) {
      const month = parseInt(monthFilter.substring(0, 2), 10);
      const year = parseInt(monthFilter.substring(2), 10);

      // Calculate start and end dates for the month
      const startDate = new Date(year, month - 1, 1); // month is 0-indexed
      const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month at 23:59:59

      const startDateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const endDateStr = endDate.toISOString().split('T')[0]; // YYYY-MM-DD

      query = query.gte('date', startDateStr).lte('date', endDateStr);
    }

    const { data: transactions, error } = await query;

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    if (!transactions) {
      response.data = {
        balance: 0,
        transactions: [],
      };
      return Response.json(response, { status: 200 });
    }

    // Transform data to camelCase
    const transformedTransactions = transactions.map(t => ({
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

    // Calculate balance based on constraint:
    // If monthFilter exists: balance = last month balance + current month income - current month expenses
    // Otherwise: standard calculation (income - expense)
    let balance = 0;
    
    if (monthFilter && monthFilter.length === 6) {
      // Get previous month data for balance calculation
      const currentMonth = parseInt(monthFilter.substring(0, 2), 10);
      const currentYear = parseInt(monthFilter.substring(2), 10);
      
      let prevMonth = currentMonth - 1;
      let prevYear = currentYear;
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear = currentYear - 1;
      }
      
      try {
        // Fetch previous month's balance
        const prevStartDate = new Date(prevYear, prevMonth - 1, 1);
        const prevEndDate = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);
        const prevStartDateStr = prevStartDate.toISOString().split('T')[0];
        const prevEndDateStr = prevEndDate.toISOString().split('T')[0];
        
        const { data: prevTransactions } = await supabase
          .from('transactions')
          .select('amount, type')
          .gte('date', prevStartDateStr)
          .lte('date', prevEndDateStr);
        
        const lastMonthBalance = prevTransactions
          ? prevTransactions.reduce((acc, t) => {
              return t.type === 'income' ? acc + t.amount : acc - t.amount;
            }, 0)
          : 0;
        
        // Calculate current month's income and expenses
        const currentIncome = transformedTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const currentExpenses = transformedTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        // Apply constraint formula
        balance = lastMonthBalance + currentIncome - currentExpenses;
      } catch (error) {
        console.warn('Could not fetch previous month data, using current calculation:', error);
        // Fallback to standard calculation
        balance = transformedTransactions.reduce((acc, transaction) => {
          return transaction.type === 'income' ? acc + transaction.amount : acc - transaction.amount;
        }, 0);
      }
    } else {
      // Standard balance calculation for non-filtered requests
      balance = transformedTransactions.reduce((acc, transaction) => {
        return transaction.type === 'income' ? acc + transaction.amount : acc - transaction.amount;
      }, 0);
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
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);
    const body = await request.json();

    const { title, description, amount, category, type, actor, date } = body;

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

    response.data = data[0];
    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
