import Link from 'next/link';

import PageContent from '@/components/PageContent';
import { newsEvents } from '@/data/newsevent';
import { formatDateRange } from '@/utils/date';

const Home = () => {
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
      <section className="border-tanakayu-accent rounded border bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xl font-bold">📅 Acara Terdekat</h2>
        <div className="mb-4 flex flex-col gap-2">
          {newsEvents
            .filter(item => item.type === 'event')
            .slice(0, 2)
            .map(item => (
              <div key={item.id}>
                <h3 className="text-tanakayu-dark text-base font-semibold">{item.title}</h3>
                <p className="text-sm">{formatDateRange(item.startDatetime, item.endDatetime)}</p>
                <p className="text-sm">Lapangan Svadhi</p>
              </div>
            ))}
        </div>
        <button className="bg-tanakayu-highlight w-full py-1 font-semibold text-white">Lihat Semua Acara</button>
      </section>
    </PageContent>
  );
};

export default Home;
