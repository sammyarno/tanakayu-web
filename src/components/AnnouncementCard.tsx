import { Badge } from '@/components/ui/badge';
import { categoryDisplayMap } from '@/data/announcements';
import { Announcement } from '@/types';
import { formatDate } from '@/utils/date';

import DeleteConfirmatonAlert from './announcement/DeleteConfirmationAlert';
import EditDialog from './announcement/EditDialog';

interface Props {
  announcement: Announcement;
  editable?: boolean;
}

const AnnouncementCard = ({ announcement, editable = false }: Props) => {
  return (
    <div className="border-tanakayu-accent flex flex-col items-start gap-2 rounded border bg-white p-3">
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
      <div className="flex items-center">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">{announcement.title}</h2>
          <p className="text-xs text-gray-700">
            {announcement.createdBy} | {formatDate(announcement.createdAt)}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-700">{announcement.content}</p>
      {editable && (
        <div className="flex w-full justify-end gap-2">
          <DeleteConfirmatonAlert announcement={announcement} />
          <EditDialog announcement={announcement} />
        </div>
      )}
    </div>
  );
};

export default AnnouncementCard;
