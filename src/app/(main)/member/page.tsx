import Link from 'next/link';

import PageContent from '@/components/PageContent';
import TopHeader from '@/components/TopHeader';

const Dashboard = () => {
  return (
    <PageContent allowedRoles={['MEMBER']}>
      <TopHeader />
      <Link
        href="/member/membership-cards"
        className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
      >
        <p className="text-center text-lg font-bold tracking-wider">🪪 Membership Cards 🪪</p>
      </Link>
      <Link
        href="/member/profile"
        className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 hover:shadow-lg"
      >
        <p className="text-center text-lg font-bold tracking-wider">👥 Profil 👥</p>
      </Link>
    </PageContent>
  );
};

export default Dashboard;
