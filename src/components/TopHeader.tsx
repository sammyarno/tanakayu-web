'use client';

import Link from 'next/link';

import SignOutButton from '@/components/SignOutButton';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/auth/useAuth';
import { useRoleCheck } from '@/hooks/auth/useRoleCheck';

const TopHeader = () => {
  const { username, isLoading, user, error } = useAuth();
  const { isAdmin } = useRoleCheck();

  const displayText = username;

  if (isLoading) {
    return <Skeleton className="h-8 w-full" />;
  }

  if (!error && user) {
    return (
      <div className="flex w-full items-center justify-end gap-2">
        <Link href={`/${isAdmin() ? 'admin' : 'member'}`}>
          <p className="flex text-center font-bold">Welcome back, {displayText}!</p>
        </Link>
        <SignOutButton size="sm" variant="ghost" />
      </div>
    );
  }

  return (
    <section className="flex items-center justify-end gap-2">
      <p className="text-sm font-bold">Have an account?</p>
      <Button variant="outline" size="sm" asChild>
        <Link href="/login">Login</Link>
      </Button>
    </section>
  );
};

export default TopHeader;
