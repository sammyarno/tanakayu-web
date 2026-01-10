'use client';

import { MembershipCard } from '@/components/MembershipCard';
import { useAuth } from '@/hooks/auth/useAuth';

const UserMembershipDisplay = () => {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return null;
  }

  return <MembershipCard />;
};

export default UserMembershipDisplay;
