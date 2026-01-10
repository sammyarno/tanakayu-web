import HomeMenu from '@/components/HomeMenu';
import { MembershipCard } from '@/components/MembershipCard';
import PageContent from '@/components/PageContent';

const Dashboard = () => {
  return (
    <PageContent allowedRoles={['MEMBER']}>
      <div className="col-span-1 space-y-4 md:col-span-2">
        <MembershipCard />
        <HomeMenu />
      </div>
    </PageContent>
  );
};

export default Dashboard;
