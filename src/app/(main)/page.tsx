import Link from 'next/link';

import AdminTitleSign from '@/components/AdminTitleSign';
import HydrateClient from '@/components/HydrateClient';
import NearestEvents from '@/components/NearestEvents';
import PageContent from '@/components/PageContent';
import { Badge } from '@/components/ui/badge';
import { prefetchNearestEvents } from '@/hooks/useNearestEvents';

const Home = async () => {
  let dehydratedState;

  try {
    // Skip prefetch during build time to prevent hanging
    if (process.env.NEXT_PHASE !== 'phase-production-build') {
      dehydratedState = await prefetchNearestEvents();
    }
  } catch (error) {
    console.warn('Failed to prefetch nearest events:', error);
    dehydratedState = null;
  }

  return (
    <PageContent>
      <AdminTitleSign />
      <section className="flex flex-col gap-4">
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
          href="/financial-report"
          className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
        >
          <h2 className="mb-1 text-lg font-semibold">💰 Laporan Keuangan</h2>
          <p className="text-sm">Lihat detail transaksi keuangan komunitas dengan transparansi penuh.</p>
        </Link>
        <Link
          // href="/contact"
          href="#"
          className="border-tanakayu-accent relative cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
        >
          {/* overlay */}
          <div className="border-tanakayu-accent bg-tanakayu-text/60 absolute top-0 left-0 h-full w-full rounded" />
          <div className="border-tanakayu-accent absolute top-0 left-0 flex h-full w-full items-center justify-center rounded border">
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
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
