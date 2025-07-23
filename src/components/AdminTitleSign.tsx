'use client';

import SignOutButton from '@/components/SignOutButton';
import { Skeleton } from '@/components/ui/skeleton';
import { useStoredUserDisplayName, useStoredUserEmail } from '@/store/userAuthStore';

const AdminTitleSign = () => {
  const email = useStoredUserEmail();
  const displayName = useStoredUserDisplayName();

  const displayText = displayName || email;

  return (
    <div className="flex w-full flex-col items-end justify-center gap-2">
      <h1 className="flex text-center text-xl font-bold">
        Welcome back, {displayText ? displayText : <Skeleton className="h-7 w-32" />}!
      </h1>
      <SignOutButton size="sm" variant="ghost" />
    </div>
  );
};

export default AdminTitleSign;
