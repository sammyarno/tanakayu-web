import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import { verifyAuth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import type { FetchResponse } from '@/types/fetch';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const response: FetchResponse<{ id: string; action: string }> = {};

  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError) return authError;

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);
    const { id: postId } = await params;
    const body = await request.json();
    const { voteType } = body;

    if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
      response.error = 'Invalid vote type';
      return Response.json(response, { status: 400 });
    }

    const userId = user!.id;
    const actor = user!.username;

    // Check for existing vote
    const { data: existing } = await supabase
      .from('post_votes')
      .select('id, vote_type')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      if (existing.vote_type === voteType) {
        // Same vote type — remove it (toggle off)
        const { error } = await supabase.from('post_votes').delete().eq('id', existing.id);
        if (error) {
          response.error = error.message;
          return Response.json(response, { status: 500 });
        }

        await logAudit(supabase, {
          action: 'delete',
          entityType: 'post_vote',
          entityId: postId,
          actor,
          metadata: { voteType },
        });

        response.data = { id: postId, action: 'removed' };
        return Response.json(response);
      } else {
        // Different vote type — update
        const { error } = await supabase
          .from('post_votes')
          .update({ vote_type: voteType })
          .eq('id', existing.id);
        if (error) {
          response.error = error.message;
          return Response.json(response, { status: 500 });
        }

        await logAudit(supabase, {
          action: 'update',
          entityType: 'post_vote',
          entityId: postId,
          actor,
          metadata: { from: existing.vote_type, to: voteType },
        });

        response.data = { id: postId, action: 'changed' };
        return Response.json(response);
      }
    }

    // No existing vote — insert
    const { error } = await supabase.from('post_votes').insert({
      post_id: postId,
      user_id: userId,
      vote_type: voteType,
    });

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    await logAudit(supabase, {
      action: 'create',
      entityType: 'post_vote',
      entityId: postId,
      actor,
      metadata: { voteType },
    });

    response.data = { id: postId, action: 'voted' };
    return Response.json(response);
  } catch (error) {
    console.error('Error voting on post:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
