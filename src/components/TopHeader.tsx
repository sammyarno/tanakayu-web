'use client';

import Link from 'next/link';

import SignOutButton from '@/components/SignOutButton';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/auth/useAuth';

const TopHeader = () => {
  const { email, displayName, isLoading, user, error } = useAuth();

  const displayText = displayName || email;

  if (isLoading) {
    return <Skeleton className="h-8 w-full" />;
  }

  if (!error && user) {
    return (
      <Link href="/admin/dashboard">
        <div className="flex w-full items-center justify-end gap-2">
          <p className="flex text-center font-bold">Welcome back, {displayText}!</p>
          <SignOutButton size="sm" variant="ghost" />
        </div>
      </Link>
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
