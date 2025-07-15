'use client';

import Link from 'next/link';

import { useNearestEvents } from '@/hooks/useNearestEvents';
import { formatDateRange } from '@/utils/date';

const NearestEvents = () => {
  const { data: events } = useNearestEvents();

  if (!events) return <></>;

  return (
    <section className="border-tanakayu-accent rounded border bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-xl font-bold">📅 Acara Terdekat</h2>
      <div className="mb-4 flex flex-col gap-2">
        {events.map(item => (
          <div key={item.id}>
            <h3 className="text-tanakayu-dark text-base font-semibold">{item.title}</h3>
            <p className="text-sm">{formatDateRange(item.startDate, item.endDate)}</p>
            <p className="text-sm">Lapangan Svadhi</p>
          </div>
        ))}
      </div>
      <Link href="/news-event?filter=event">
        <button className="bg-tanakayu-highlight w-full py-1 font-semibold text-white">Lihat Semua Acara</button>
      </Link>
    </section>
  );
};

export default NearestEvents;
