import { memo, useState } from 'react';

import DeleteConfirmationAlert from '@/components/news-event/DeleteConfirmationAlert';
import EditDialog from '@/components/news-event/EditDialog';
import type { NewsEventWithComment } from '@/types';
import { formatDate } from '@/utils/date';
import DOMPurify from 'dompurify';
import { Calendar } from 'lucide-react';

import PostComment from './PostComment';

interface NewsEventCardProps {
  item: NewsEventWithComment;
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

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full space-y-1">
      <div
        className="prose prose-sm max-w-none cursor-pointer text-sm text-gray-700"
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
          <button onClick={toggleExpanded} className="text-tanakayu-dark text-xs font-medium">
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      )}
    </div>
  );
};

const NewsEventCard = memo(function NewsEventCard({ item, editable = false }: NewsEventCardProps) {
  return (
    <div className="border-tanakayu-accent rounded border p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="flex items-center text-lg font-semibold">
            <Calendar className="text-tanaka-highlight mr-2 h-5 w-5" />[{item.type === 'news' ? 'Berita' : 'Acara'}]{' '}
            {item.title}
          </h2>
          <p className="mb-2 text-xs text-gray-600">
            {item.createdBy} | {formatDate(item.createdAt)}
          </p>
          <ContentWithToggle content={item.content} />
        </div>
        {editable && (
          <div className="ml-2 flex items-center gap-1">
            <EditDialog item={item} />
            <DeleteConfirmationAlert item={item} />
          </div>
        )}
      </div>
      <hr className="my-2" />
      <PostComment comments={item.comments} editable={editable} postId={item.id} type="news_event" />
    </div>
  );
});

export default NewsEventCard;
