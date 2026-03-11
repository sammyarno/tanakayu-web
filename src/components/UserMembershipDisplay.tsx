'use client';

import { MembershipCard } from '@/components/MembershipCard';
import { ROLES } from '@/constants/roles';
import { useAuth } from '@/hooks/auth/useAuth';

const UserMembershipDisplay = () => {
  const { user, isLoading } = useAuth();

  if (isLoading || !user || user.role === ROLES.MERCHANT) {
    return null;
  }

  return <MembershipCard />;
};

export default UserMembershipDisplay;
