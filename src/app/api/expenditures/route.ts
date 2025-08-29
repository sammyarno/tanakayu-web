import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import type { CreateExpenditureRequest, Expenditure } from '@/types/expenditure';
import type { FetchResponse } from '@/types/fetch';

// GET - Fetch all expenditures
export async function GET() {
  const response: FetchResponse<Expenditure[]> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);

    const { data, error } = await supabase.from('expenditures').select('*').order('date', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    response.data =
      data?.map(item => ({
        id: item.id,
        date: item.date,
        description: item.description,
        imagePath: item.image_path,
        createdAt: item.created_at,
        createdBy: item.created_by,
        modifiedAt: item.modified_at,
        modifiedBy: item.modified_by,
      })) || [];
    return Response.json(response);
  } catch (error) {
    console.error('Expenditures API error:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}

// POST - Create new expenditure
export async function POST(request: NextRequest) {
  const response: FetchResponse<Expenditure> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);

    const body: CreateExpenditureRequest = await request.json();
    const { date, description, image_path, actor } = body;

    if (!date || !description || !image_path || !actor) {
      response.error = 'Missing required fields';
      return Response.json(response, { status: 400 });
    }

    // Check if expenditure already exists for this month
    const monthStart = new Date(date);
    monthStart.setDate(1);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);

    const { data: existingExpenditure } = await supabase
      .from('expenditures')
      .select('id')
      .gte('date', monthStart.toISOString().split('T')[0])
      .lte('date', monthEnd.toISOString().split('T')[0])
      .single();

    if (existingExpenditure) {
      response.error = 'Expenditure report already exists for this month';
      return Response.json(response, { status: 409 });
    }

    const { data, error } = await supabase
      .from('expenditures')
      .insert({
        date: `${date}-01`,
        description,
        image_path,
        created_by: actor,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    response.data = {
      id: data.id,
      date: data.date,
      description: data.description,
      imagePath: data.image_path,
      createdAt: data.created_at,
      createdBy: data.created_by,
      modifiedAt: data.modified_at,
      modifiedBy: data.modified_by,
    };
    return Response.json(response, { status: 201 });
  } catch (error) {
    console.error('Create expenditure API error:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
