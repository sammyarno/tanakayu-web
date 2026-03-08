import { memo, useState } from 'react';

import dynamic from 'next/dynamic';

import { Badge } from '@/components/ui/badge';
import { categoryDisplayMap } from '@/data/posts';
import type { PostWithComments } from '@/types/post';
import { formatDate } from '@/utils/date';
import DOMPurify from 'dompurify';
import { Calendar } from 'lucide-react';

import PostComment from '../PostComment';

const DeleteConfirmationAlert = dynamic(() => import('./DeleteConfirmationAlert'));
const EditDialog = dynamic(() => import('./EditDialog'));

interface Props {
  post: PostWithComments;
  editable?: boolean;
}

const ContentWithToggle = ({ content }: { content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel'],
  });

  const createTruncatedContent = (htmlContent: string, maxLength: number = 150) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    if (textContent.length <= maxLength) {
      return htmlContent;
    }

    return textContent.substring(0, maxLength) + '...';
  };

  const truncatedContent = createTruncatedContent(sanitizedContent);
  const needsTruncation = sanitizedContent.length > 150;

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
      <PostComment comments={post.comments} editable={editable} postId={post.id} />
    </div>
  );
});

export default PostCard;
