import Link from 'next/link';

import PageContent from '@/components/PageContent';

const Dashboard = () => {
  return (
    <PageContent allowedRoles={['ADMIN']}>
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
        href="/admin/expenditure-report"
        className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
      >
        <p className="text-center text-lg font-bold tracking-wider">💸 Laporan Keuangan 💸</p>
      </Link>
    </PageContent>
  );
};

export default Dashboard;
