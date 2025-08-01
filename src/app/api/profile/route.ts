import { createServerClient } from '@/plugins/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const body = await request.json();
    
    const { displayName, email, password } = body;

    // Prepare the update data for Supabase auth
    const updateData: any = {};
    
    if (email) {
      updateData.email = email;
    }
    
    if (password) {
      updateData.password = password;
    }
    
    // Update user metadata for display name
    if (displayName) {
      updateData.data = {
        display_name: displayName, 
        full_name: displayName
      };
    }
    
    const { data: updatedUser, error } = await supabase.auth.updateUser(updateData);
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}