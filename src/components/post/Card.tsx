import { memo, useMemo, useState } from 'react';

import dynamic from 'next/dynamic';

import { Badge } from '@/components/ui/badge';
import { categoryDisplayMap } from '@/data/posts';
import { useAuth } from '@/hooks/auth/useAuth';
import { useVotePost } from '@/hooks/useVotePost';
import type { PostWithVotes } from '@/types/post';
import { formatDate } from '@/utils/date';
import DOMPurify from 'dompurify';
import { Calendar, ThumbsDown, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

const DeleteConfirmationAlert = dynamic(() => import('./DeleteConfirmationAlert'));
const EditDialog = dynamic(() => import('./EditDialog'));

interface Props {
  post: PostWithVotes;
  editable?: boolean;
}

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel'],
};

const ContentWithToggle = ({ content }: { content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { sanitizedContent, truncatedContent, needsTruncation } = useMemo(() => {
    const sanitized = DOMPurify.sanitize(content, SANITIZE_CONFIG);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitized;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    const truncated = textContent.length <= 150 ? sanitized : textContent.substring(0, 150) + '...';

    return {
      sanitizedContent: sanitized,
      truncatedContent: truncated,
      needsTruncation: sanitized.length > 150,
    };
  }, [content]);

  return (
    <div className="w-full space-y-1">
      <div
        className="max-w-none cursor-pointer text-sm text-gray-700 [&_a]:text-blue-500 [&_a]:underline"
        dangerouslySetInnerHTML={{
          __html:
            typeof window !== 'undefined'
              ? isExpanded
                ? sanitizedContent
                : truncatedContent
              : content.substring(0, 150) + '...',
        }}
      />
      {needsTruncation && (
        <div className="text-right">
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-tanakayu-dark text-xs font-medium">
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      )}
    </div>
  );
};

const VoteButtons = ({ post }: { post: PostWithVotes }) => {
  const { userId } = useAuth();
  const { mutate: vote, isPending } = useVotePost(userId);

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (!userId) {
      toast.error('Silakan login terlebih dahulu untuk vote', {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }
    vote({ postId: post.id, voteType });
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleVote('upvote')}
        disabled={isPending}
        className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors ${
          post.userVote === 'upvote'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
        } disabled:opacity-50`}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{post.upvotes}</span>
      </button>
      <button
        onClick={() => handleVote('downvote')}
        disabled={isPending}
        className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors ${
          post.userVote === 'downvote'
            ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
        } disabled:opacity-50`}
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{post.downvotes}</span>
      </button>
    </div>
  );
};

const PostCard = memo(function PostCard({ post, editable = false }: Props) {
  const isAcara = post.type === 'acara';

  return (
    <div className="border-tanakayu-accent flex flex-col items-start gap-3 rounded border bg-white p-3">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {isAcara ? (
            <Badge variant="default" className="bg-amber-100 text-amber-800">
              <Calendar className="mr-1 h-4 w-4" />
              Acara
            </Badge>
          ) : (
            post.categories.map(cat => {
              const catDisplay = categoryDisplayMap[cat.code];
              return (
                <Badge
                  key={`${post.id}-${cat.id}`}
                  variant="default"
                  className={`${catDisplay?.bgColor} ${catDisplay?.textColor}`}
                >
                  {catDisplay?.icon}
                  {cat.label}
                </Badge>
              );
            })
          )}
        </div>
        {editable && (
          <div className="ml-2 flex items-center gap-1">
            <EditDialog post={post} />
            <DeleteConfirmationAlert post={post} />
          </div>
        )}
      </div>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{post.title}</h2>
          <p className="text-xs text-gray-700">
            {post.createdBy} | {formatDate(post.createdAt)}
          </p>
        </div>
      </div>
      <ContentWithToggle content={post.content} />
      <hr className="w-full" />
      <VoteButtons post={post} />
    </div>
  );
});

export default PostCard;
