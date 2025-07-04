import { cookies } from 'next/headers';
import Link from 'next/link';

import HydrateClient from '@/components/HydrateClient';
import NearestEvents from '@/components/NearestEvents';
import PageContent from '@/components/PageContent';
import { usePrefetchNearestEvents } from '@/hooks/useNearestEvents';
import { createServerClient } from '@/plugins/supabase/server';

const Home = async () => {
  const cookieStore = await cookies();
  const supaClient = createServerClient(cookieStore);
  const dehydratedState = await usePrefetchNearestEvents(supaClient);

  return (
    <PageContent>
      {/* section menu */}
      <section id="menu" className="flex flex-col gap-4">
        <Link
          href="/news-event"
          className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
        >
          <h2 className="mb-1 text-lg font-semibold">📰 Berita & Acara</h2>
          <p className="text-sm">Lihat acara yang akan datang dan kabar terbaru dari komunitas.</p>
        </Link>
        <Link
          href="/announcement"
          className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
        >
          <h2 className="mb-1 text-lg font-semibold">📢 Pengumuman</h2>
          <p className="text-sm">Informasi penting seperti pemadaman listrik, perbaikan, dll.</p>
        </Link>
        <Link
          href="/contact"
          className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
        >
          <h2 className="mb-1 text-lg font-semibold">👥 Tim & Kontak</h2>
          <p className="text-sm">Kenali pengurus lingkungan dan cara menghubungi mereka.</p>
        </Link>
      </section>

      {/* events */}
      <HydrateClient state={dehydratedState}>
        <NearestEvents />
      </HydrateClient>
    </PageContent>
  );
};

export default Home;
