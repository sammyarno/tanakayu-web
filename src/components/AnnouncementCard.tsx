import { FC } from 'react';

import { Announcement, Category } from '@/types';

interface Props {
  announcement: Announcement;
  categories: Category[];
}

const AnnouncementCard: FC<Props> = ({ announcement, categories }) => {
  return (
    <div className="border-tanakayu-accent flex flex-col items-start gap-2 rounded border bg-white p-3">
      <div className="flex flex-wrap gap-2">
        {announcement.categories.map(catName => {
          const catInfo = categories.find(c => c.value === catName);
          return (
            <span
              key={catName}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs tracking-wide ${catInfo?.bgColor} ${catInfo?.textColor}`}
            >
              {catInfo?.icon}
              {catName}
            </span>
          );
        })}
      </div>
      <div className="flex items-center">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">{announcement.title}</h2>
          <p className="text-xs text-gray-700">Created by: Yessi Liem | 10 Juli 2025</p>
        </div>
      </div>
      <p className="text-sm text-gray-700">{announcement.content}</p>
    </div>
  );
};

export default AnnouncementCard;
