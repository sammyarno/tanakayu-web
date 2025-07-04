import { categoryDisplayMap } from '@/data/announcements';
import type { Announcement } from '@/types';
import { formatDate } from '@/utils/date';

interface Props {
  announcement: Announcement;
}

const AnnouncementCard = ({ announcement }: Props) => {
  return (
    <div className="border-tanakayu-accent flex flex-col items-start gap-2 rounded border bg-white p-3">
      <div className="flex flex-wrap gap-2">
        {announcement.categories.map(cat => {
          const catDisplay = categoryDisplayMap[cat.code];

          return (
            <span
              key={`${announcement.id}-${cat.id}`}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs tracking-wide ${catDisplay?.bgColor} ${catDisplay?.textColor}`}
            >
              {catDisplay?.icon}
              {cat.label}
            </span>
          );
        })}
      </div>
      <div className="flex items-center">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">{announcement.title}</h2>
          <p className="text-xs text-gray-700">
            Created by: {announcement.createdBy} | {formatDate(announcement.createdAt)}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-700">{announcement.content}</p>
    </div>
  );
};

export default AnnouncementCard;
