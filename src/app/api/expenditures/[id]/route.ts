import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import type { Expenditure, UpdateExpenditureRequest } from '@/types/expenditure';
import type { FetchResponse } from '@/types/fetch';

// PATCH - Update expenditure
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const response: FetchResponse<Expenditure> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);

    const { id } = await params;
    const body: UpdateExpenditureRequest = await request.json();
    const { date, description, image_path, actor } = body;

    if (!actor) {
      response.error = 'Actor is required';
      return Response.json(response, { status: 400 });
    }

    // Build update object
    const updateData: any = {
      modified_by: actor,
      modified_at: new Date().toISOString(),
    };

    if (date) updateData.date = date;
    if (description) updateData.description = description;
    if (image_path) updateData.image_path = image_path;

    const { data, error } = await supabase.from('expenditures').update(updateData).eq('id', id).select().single();

    if (error) {
      console.error('Database error:', error);
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    if (!data) {
      response.error = 'Expenditure not found';
      return Response.json(response, { status: 404 });
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

    return Response.json(response);
  } catch (error) {
    console.error('Update expenditure API error:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}

// DELETE - Delete expenditure
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const response: FetchResponse<{ success: boolean }> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);

    const { id } = params;

    const { error } = await supabase.from('expenditures').delete().eq('id', id);

    if (error) {
      console.error('Database error:', error);
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    response.data = { success: true };
    return Response.json(response);
  } catch (error) {
    console.error('Delete expenditure API error:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
