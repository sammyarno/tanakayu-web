import Link from 'next/link';

import PageContent from '@/components/PageContent';
import TopHeader from '@/components/TopHeader';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  return (
    <PageContent allowedRoles={['ADMIN']}>
      <TopHeader />
      <Link
        href="/admin/news-event"
        className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
      >
        <p className="text-center text-lg font-bold tracking-wide">📰 Berita dan Acara 📰</p>
      </Link>
      <Link
        href="/admin/announcement"
        className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
      >
        <p className="text-center text-lg font-bold tracking-wider">📢 Pengumuman 📢</p>
      </Link>
      <Link
        href="/admin/transaction-report"
        className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
      >
        <p className="text-center text-lg font-bold tracking-wider">💰 Laporan Transaksi 💰</p>
      </Link>
      <Link
        // href="/admin/contact"
        href="#"
        className="border-tanakayu-accent relative cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
      >
        {/* overlay */}
        <div className="border-tanakayu-accent bg-tanakayu-text/60 absolute top-0 left-0 h-full w-full rounded" />
        <div className="border-tanakayu-accent absolute top-0 left-0 flex h-full w-full items-center justify-center rounded border">
          <Badge variant="secondary">Coming Soon</Badge>
        </div>
        <p className="text-center text-lg font-bold tracking-wider">👥 Tim & Kontak 👥</p>
      </Link>

      <hr className="my-4" />
      <Link
        href="/admin/profile"
        className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
      >
        <p className="text-center text-lg font-bold tracking-wider">👥 Profil 👥</p>
      </Link>
    </PageContent>
  );
};

export default Dashboard;
