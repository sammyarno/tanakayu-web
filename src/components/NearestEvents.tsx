'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useNearestEvents } from '@/hooks/useNearestEvents';
import { formatDateRange } from '@/utils/date';
import { CalendarDays } from 'lucide-react';

import { Skeleton } from './ui/skeleton';

const NearestEvents = () => {
  const { data: fetchedEvents, isFetching } = useNearestEvents();

  if (isFetching) return <Skeleton className="h-[200px] w-full" />;

  return (
    <section className="relative rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">📅 Acara Terdekat</h2>
        <Button variant="link" asChild className="text-tanakayu-dark h-auto p-0 font-semibold">
          <Link href="/post?filter=acara">Lihat Semua</Link>
        </Button>
      </div>

      {fetchedEvents && fetchedEvents.length > 0 ? (
        <Carousel
          opts={{
            align: 'start',
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3 pb-4">
            {fetchedEvents.map(item => (
              <CarouselItem key={item.id} className="basis-10/12 pl-3 sm:basis-2/3 md:basis-1/2 lg:basis-1/3">
                <div className="flex h-full flex-col justify-between rounded-lg border border-slate-100 bg-slate-50 p-4 shadow-sm transition-shadow hover:shadow-md">
                  <div>
                    <div className="text-tanakayu-highlight mb-2 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span className="text-xs font-semibold">{formatDateRange(item.start, item.end)}</span>
                    </div>
                    <h3 className="line-clamp-1 text-sm font-bold text-slate-800">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.content}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : (
        <div className="flex w-full items-center justify-center p-2 text-center text-sm text-slate-500">
          Saat ini tidak ada acara terdekat.
        </div>
      )}
    </section>
  );
};

export default NearestEvents;
