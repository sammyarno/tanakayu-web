import Breadcrumb from '@/components/Breadcrumb';
import PageHeader from '@/components/PageHeader';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import { Settings } from 'lucide-react';

const Loading = () => (
  <main className="flex w-full flex-col gap-6 py-4">
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { label: 'Home', link: '/member' },
          { label: 'Profile', link: '/member/profile' },
        ]}
      />
      <PageHeader icon={Settings} title="Account Settings" description="Manage your account settings and preferences." />
    </div>

    <ProfileSkeleton />
  </main>
);

export default Loading;
