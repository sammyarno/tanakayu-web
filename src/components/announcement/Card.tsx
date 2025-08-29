import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { categoryDisplayMap } from '@/data/announcements';
import type { Announcement } from '@/types/announcement';
import { formatDate } from '@/utils/date';
import DOMPurify from 'dompurify';

import DeleteConfirmatonAlert from './DeleteConfirmationAlert';
import EditDialog from './EditDialog';

interface Props {
  announcement: Announcement;
  editable?: boolean;
}

const ContentWithToggle = ({ content }: { content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'img', 'a'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel'],
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
          <button onClick={toggleExpanded} className="text-tanakayu-dark text-xs font-medium">
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      )}
    </div>
  );
};

const AnnouncementCard = ({ announcement, editable = false }: Props) => {
  return (
    <div className="border-tanakayu-accent flex flex-col items-start gap-3 rounded border bg-white p-3">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {announcement.categories.map(cat => {
            const catDisplay = categoryDisplayMap[cat.code];

            return (
              <Badge
                key={`${announcement.id}-${cat.id}`}
                variant="default"
                className={`${catDisplay?.bgColor} ${catDisplay?.textColor}`}
              >
                {catDisplay?.icon}
                {cat.label}
              </Badge>
            );
          })}
        </div>
        {editable && (
          <div className="ml-2 flex items-center gap-1">
            <EditDialog announcement={announcement} />
            <DeleteConfirmatonAlert announcement={announcement} />
          </div>
        )}
      </div>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{announcement.title}</h2>
          <p className="text-xs text-gray-700">
            {announcement.createdBy} | {formatDate(announcement.createdAt)}
          </p>
        </div>
      </div>
      <ContentWithToggle content={announcement.content} />
    </div>
  );
};

export default AnnouncementCard;
