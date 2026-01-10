'use client';

import { MembershipCard } from '@/components/MembershipCard';
import { useAuth } from '@/hooks/auth/useAuth';

const UserMembershipDisplay = () => {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="mb-4">
      <MembershipCard />
    </div>
  );
};

export default UserMembershipDisplay;
