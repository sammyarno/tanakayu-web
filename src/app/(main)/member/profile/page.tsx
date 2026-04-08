'use client';

import Breadcrumb from '@/components/Breadcrumb';
import LoadingIndicator from '@/components/LoadingIndicator';
import PageContent from '@/components/PageContent';
import { ChangePasswordSection } from '@/components/profile/ChangePasswordSection';
import { PersonalInfoSection } from '@/components/profile/PersonalInfoSection';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { SignOutSection } from '@/components/profile/SignOutSection';
import { ALL_ROLES } from '@/constants/roles';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchProfile } from '@/hooks/useFetchProfile';

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
        <div className="space-y">
          <h2 className="text-tanakayu-text font-sans text-3xl font-bold">Account Settings</h2>
          <p className="text-tanakayu-text">Manage your account settings and preferences.</p>
        </div>
      </div>

      {isFetching || !profile ? (
        <div className="flex justify-center py-12">
          <LoadingIndicator isLoading />
        </div>
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
