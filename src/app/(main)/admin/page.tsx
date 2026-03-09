import Link from 'next/link';

import PageContent from '@/components/PageContent';

const Dashboard = () => {
  return (
    <PageContent allowedRoles={['SUPERADMIN', 'ADMINISTRATOR']}>
      <Link
        href="/admin/post"
        className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
      >
        <p className="text-center text-lg font-bold tracking-wide">📢 Pengumuman & Acara 📢</p>
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
