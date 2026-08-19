'use client';

import Breadcrumb from '@/components/Breadcrumb';
import PageContent from '@/components/PageContent';
import PageHeader from '@/components/PageHeader';
import { ChangePasswordSection } from '@/components/profile/ChangePasswordSection';
import { PersonalInfoSection } from '@/components/profile/PersonalInfoSection';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import { SignOutSection } from '@/components/profile/SignOutSection';
import { ALL_ROLES } from '@/constants/roles';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchProfile } from '@/hooks/useFetchProfile';
import { Settings } from 'lucide-react';

const ProfilePage = () => {
  const { userId, username } = useAuth();
  const { data: profile, isFetching } = useFetchProfile({ id: userId || '', username: username || '' });

  return (
    <PageContent allowedRoles={ALL_ROLES} fallbackPath="/member">
      <div className="space-y-4">
        <Breadcrumb
          items={[
            { label: 'Home', link: '/member' },
            { label: 'Profile', link: '/member/profile' },
          ]}
        />
        <PageHeader icon={Settings} title="Account Settings" description="Manage your account settings and preferences." />
      </div>

      {isFetching || !profile ? (
        <ProfileSkeleton />
      ) : (
        <div className="space-y-6">
          <ProfileHeader profile={profile} />
          <PersonalInfoSection profile={profile} />
          <ChangePasswordSection userId={profile.id} />
          <SignOutSection />
        </div>
      )}
    </PageContent>
  );
};

export default ProfilePage;
