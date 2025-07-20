'use client';

import { Skeleton } from '@/components/ui/skeleton';
import SignOutButton from '@/components/SignOutButton';
import { useUserAuthStore } from '@/store/userAuthStore';
import { useEffect } from 'react';

const AdminTitleSign = () => {
  const { user, fetchUser, isLoading } = useUserAuthStore();
  
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      <h1 className="text-center text-xl font-bold">
        Welcome back, {user ? user.email : <Skeleton className="h-7 w-36" />}!
      </h1>
      <SignOutButton size="sm" />
    </div>
  );
};

export default AdminTitleSign;
