import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Phone } from 'lucide-react';

const HomeMenu = () => {
  return (
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
        href="/transaction-report"
        className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
      >
        <h2 className="mb-1 text-lg font-semibold">💰 Laporan Transaksi</h2>
        <p className="text-sm">Lihat detail transaksi keuangan komunitas dengan transparansi penuh.</p>
      </Link>
      <Link
        href="/expenditure-report"
        className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
      >
        <h2 className="mb-1 text-lg font-semibold">💸 Laporan Keuangan</h2>
        <p className="text-sm">Lihat detail transaksi keuangan komunitas.</p>
      </Link>
      <Link
        href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE}`}
        className="flex cursor-pointer items-center justify-between rounded border border-red-200 bg-red-50 p-4 shadow-sm transition-all hover:bg-red-100 hover:shadow-md"
      >
        <div>
          <h2 className="mb-1 flex items-center text-lg font-bold text-red-700">📞 Call Helpdesk</h2>
          <p className="text-sm font-medium text-red-600">Butuh bantuan darurat? Hubungi kami segera.</p>
        </div>
        <div className="rounded-full bg-red-200 p-2 text-red-700">
          <Phone className="size-8" />
        </div>
      </Link>
    </section>
  );
};

export default HomeMenu;
