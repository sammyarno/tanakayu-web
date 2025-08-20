'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useNearestEvents } from '@/hooks/useNearestEvents';
import { formatDateRange } from '@/utils/date';

import { Skeleton } from './ui/skeleton';

const NearestEvents = () => {
  const { data: events, isFetching } = useNearestEvents();

  if (!events || isFetching) return <Skeleton className="h-[200px] w-full" />;

  return (
    <section className="border-tanakayu-accent rounded border bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-xl font-bold">📅 Acara Terdekat</h2>
      <div className="mb-4 flex flex-col gap-2">
        {events.map(item => (
          <div key={item.id}>
            <h3 className="text-tanakayu-dark text-base font-semibold">{item.title}</h3>
            <p className="text-sm">{formatDateRange(item.start, item.end)}</p>
            <p className="text-sm">{item.content}</p>
          </div>
        ))}
      </div>
      <Button asChild className="bg-tanakayu-highlight w-full py-1 font-semibold text-white">
        <Link href="/news-event?filter=event">Lihat Semua Acara</Link>
      </Button>
    </section>
  );
};

export default NearestEvents;
