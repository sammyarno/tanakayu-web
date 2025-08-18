import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'uploads'; // Default to uploads

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate folder (security check)
    const allowedFolders = ['announcements', 'news-events', 'uploads'];
    if (!allowedFolders.includes(folder)) {
      return Response.json({ error: 'Invalid folder specified' }, { status: 400 });
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
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('tanakayu').getPublicUrl(fileName);

    return Response.json({
      success: true,
      fileName,
      url: urlData.publicUrl,
      path: data.path,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
