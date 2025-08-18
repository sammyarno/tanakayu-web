import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import type { FetchResponse } from '@/types/fetch';

export async function POST(request: NextRequest) {
  const response: FetchResponse<{
    success: boolean;
    fileName: string;
    url: string;
    path: string;
  }> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'uploads'; // Default to uploads

    if (!file) {
      response.error = 'No file provided';
      return Response.json(response, { status: 400 });
    }

    // Validate folder (security check)
    const allowedFolders = ['announcements', 'news-events', 'uploads'];
    if (!allowedFolders.includes(folder)) {
      response.error = 'Invalid folder specified';
      return Response.json(response, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from('tanakayu').upload(fileName, uint8Array, {
      contentType: file.type,
      upsert: false,
      cacheControl: '3600',
    });

    if (error) {
      console.error('Storage upload error:', error);
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('tanakayu').getPublicUrl(fileName);

    response.data = {
      success: true,
      fileName,
      url: urlData.publicUrl,
      path: data.path,
    };
    return Response.json(response);
  } catch (error) {
    console.error('Upload API error:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
