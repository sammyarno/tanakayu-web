'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROLES } from '@/constants/roles';
import { useAuth } from '@/hooks/auth/useAuth';

const TopHeader = () => {
  const { username, isLoading, user, error, role } = useAuth();

  const displayText = username;

  if (isLoading) {
    return <Skeleton className="h-8 w-full" />;
  }

  if (!error && user) {
    return (
      <div className="flex w-full items-center justify-end gap-2">
        <Link href={role === ROLES.SUPERADMIN ? '/admin' : '/'}>
          <p className="flex text-center font-bold">Welcome, {displayText}!</p>
        </Link>
      </div>
    );
  }

  return (
    <section className="flex items-center justify-end gap-2">
      <p className="text-sm font-bold">Sudah punya akun?</p>
      <Button variant="outline" size="sm" asChild>
        <Link href="/login">Login</Link>
      </Button>
    </section>
  );
};

export default TopHeader;
