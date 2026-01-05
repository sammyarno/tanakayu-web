import Link from 'next/link';

import { MembershipCard } from '@/components/MembershipCard';
import PageContent from '@/components/PageContent';
import TopHeader from '@/components/TopHeader';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, User } from 'lucide-react';

const Dashboard = () => {
  return (
    <PageContent allowedRoles={['MEMBER']}>
      {/* <TopHeader /> */}
      <div className="col-span-1 md:col-span-2">
        <MembershipCard />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <Link href="/member/membership-cards" className="group">
          <Card className="border-tanakayu-accent/20 hover:border-tanakayu-accent py-4 transition-all hover:shadow-lg">
            <CardContent className="flex flex-col items-center justify-center space-y-2 px-2 py-0 text-center">
              <div className="bg-tanakayu-accent/10 group-hover:bg-tanakayu-accent/20 rounded-full transition-colors">
                <CreditCard className="text-tanakayu-accent size-8" />
              </div>
              <h3 className="text-sm font-semibold tracking-wide">Cards</h3>
            </CardContent>
          </Card>
        </Link>

        <Link href="/member/profile" className="group">
          <Card className="border-tanakayu-accent/20 hover:border-tanakayu-accent py-4 transition-all hover:shadow-lg">
            <CardContent className="flex flex-col items-center justify-center space-y-2 px-2 py-0 text-center">
              <div className="bg-tanakayu-accent/10 group-hover:bg-tanakayu-accent/20 rounded-full transition-colors">
                <User className="text-tanakayu-accent size-8" />
              </div>
              <h3 className="text-sm font-semibold tracking-wide">Profile</h3>
            </CardContent>
          </Card>
        </Link>
      </div>
    </PageContent>
  );
};

export default Dashboard;
