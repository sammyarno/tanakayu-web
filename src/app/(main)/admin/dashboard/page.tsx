import Link from 'next/link';

import AdminTitleSign from '@/components/AdminTitleSign';
import PageContent from '@/components/PageContent';

const Dashboard = () => {
  return (
    <PageContent>
      <AdminTitleSign />
      <Link
        href="/admin/news-event"
        className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
      >
        <p className="text-center text-lg font-bold tracking-wide">📰 Berita dan Acara 📰</p>
      </Link>
      <Link
        href="admin/announcement"
        className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
      >
        <p className="text-center text-lg font-bold tracking-wider">📢 Pengumuman 📢</p>
      </Link>
      <Link
        href="/admin/financial-report"
        className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
      >
        <p className="text-center text-lg font-bold tracking-wider">💰 Laporan Keuangan 💰</p>
      </Link>
      <Link
        href="/admin/contact"
        className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
      >
        <p className="text-center text-lg font-bold tracking-wider">👥 Tim & Kontak 👥</p>
      </Link>
      <hr className="my-4" />
      <Link
        href="/admin/profile"
        className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
      >
        <p className="text-center text-lg font-bold tracking-wider">👥 Ubah Profil 👥</p>
      </Link>
    </PageContent>
  );
};

export default Dashboard;
