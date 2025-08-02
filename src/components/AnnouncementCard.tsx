import { Badge } from '@/components/ui/badge';
import { categoryDisplayMap } from '@/data/announcements';
import { Announcement } from '@/types';
import { formatDate } from '@/utils/date';
import DOMPurify from 'dompurify';

import DeleteConfirmatonAlert from './announcement/DeleteConfirmationAlert';
import EditDialog from './announcement/EditDialog';

interface Props {
  announcement: Announcement;
  editable?: boolean;
}

const AnnouncementCard = ({ announcement, editable = false }: Props) => {
  // Sanitize HTML content for safe rendering
  const sanitizedContent = DOMPurify.sanitize(announcement.content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'img', 'a'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel']
  });

  // Create a truncated version for card display
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

  return (
    <div className="border-tanakayu-accent flex flex-col items-start gap-2 rounded border bg-white p-3">
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
      <div 
        className="text-sm text-gray-700 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ 
          __html: typeof window !== 'undefined' ? truncatedContent : announcement.content.substring(0, 150) + '...' 
        }}
      />
    </div>
  );
};

export default AnnouncementCard;
