import { authenticatedFetchJson } from '@/lib/fetch';
import type { SimpleResponse } from '@/types/fetch';
import type { PostWithVotes } from '@/types/post';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface VotePostRequest {
  postId: string;
  voteType: 'upvote' | 'downvote';
}

const votePost = async (payload: VotePostRequest) => {
  const response = await authenticatedFetchJson<SimpleResponse>(`/api/posts/${payload.postId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ voteType: payload.voteType }),
  });

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
};

export const useVotePost = (currentUserId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VotePostRequest) => votePost(payload),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      const updateCache = (oldData: PostWithVotes[] | undefined) => {
        if (!oldData) return oldData;

        return oldData.map(post => {
          if (post.id !== variables.postId) return post;

          const hadUpvote = post.userVote === 'upvote';
          const hadDownvote = post.userVote === 'downvote';
          const isToggleOff = post.userVote === variables.voteType;

          let upvotes = post.upvotes;
          let downvotes = post.downvotes;
          let userVote: 'upvote' | 'downvote' | null;

          if (isToggleOff) {
            // Remove vote
            if (hadUpvote) upvotes--;
            if (hadDownvote) downvotes--;
            userVote = null;
          } else {
            // Add or switch vote
            if (hadUpvote) upvotes--;
            if (hadDownvote) downvotes--;
            if (variables.voteType === 'upvote') upvotes++;
            if (variables.voteType === 'downvote') downvotes++;
            userVote = variables.voteType;
          }

          return { ...post, upvotes, downvotes, userVote };
        });
      };

      queryClient.setQueriesData({ queryKey: ['posts'] }, updateCache);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
