'use client';

import Link from 'next/link';

import SignOutButton from '@/components/SignOutButton';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStoredUserDisplayName, useStoredUserEmail, useUserAuthStore } from '@/store/userAuthStore';

const AdminTitleSign = () => {
  const email = useStoredUserEmail();
  const displayName = useStoredUserDisplayName();
  const { isLoading, user, error } = useUserAuthStore();

  const displayText = displayName || email;

  if (isLoading) {
    return <Skeleton className="h-8 w-full" />;
  }

  if (!error && user) {
    return (
      <div className="flex w-full items-center justify-end gap-2">
        <p className="flex text-center font-bold">Welcome back, {displayText}!</p>
        <SignOutButton size="sm" variant="ghost" />
      </div>
    );
  }

  return (
    <section className="flex items-center justify-end gap-2">
      <p className="text-sm font-bold">Are you an admin?</p>
      <Button variant="outline" size="sm" asChild>
        <Link href="/login">Login</Link>
      </Button>
    </section>
  );
};

export default AdminTitleSign;
