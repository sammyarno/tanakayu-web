import { createServerClient } from '@/plugins/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
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
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!transactions) {
      return Response.json({ balance: 0, transactions: [] });
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

    // Calculate balance (income - expense)
    const balance = transformedTransactions.reduce((acc, transaction) => {
      return transaction.type === 'income'
        ? acc + transaction.amount
        : acc - transaction.amount;
    }, 0);

    // Group transactions by date
    const transactionsByDate = transformedTransactions.reduce((acc, transaction) => {
      const date = transaction.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {} as Record<string, typeof transformedTransactions>);

    return Response.json({ balance, transactions: transactionsByDate });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
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
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data: data?.[0]?.id });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}