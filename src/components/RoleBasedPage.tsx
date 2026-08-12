'use client';

import { type ReactNode, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/auth/useAuth';
import type { UserRole } from '@/hooks/auth/useRoleCheck';

interface RoleBasedPageProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

const RoleBasedPage = ({ children, allowedRoles, fallbackPath = '/login' }: RoleBasedPageProps) => {
  const { user, role, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect once we've actually confirmed there's no session (persisted
    // `user` from localStorage is not proof enough - isInitialized is).
    if (!isInitialized || isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (role && !allowedRoles.includes(role as UserRole)) {
      router.push(fallbackPath);
      return;
    }
  }, [user, role, isLoading, isInitialized, router, allowedRoles, fallbackPath]);

  // Render optimistically off the persisted user (available synchronously from
  // localStorage) instead of blanking the page until initialize() round-trips.
  if (!user) {
    return <></>;
  }

  if (role && !allowedRoles.includes(role as UserRole)) {
    return <></>;
  }

  return <>{children}</>;
};

export default RoleBasedPage;
export type { UserRole };
