'use client';

import { type ReactNode, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/auth/useAuth';

type UserRole = 'ADMIN' | 'MEMBER';

interface RoleBasedPageProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

const RoleBasedPage = ({ 
  children, 
  allowedRoles, 
  fallbackPath = '/login' 
}: RoleBasedPageProps) => {
  const { user, role, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isLoading) {
      // Not authenticated - redirect to login
      if (!user) {
        router.push('/login');
        return;
      }

      // Authenticated but wrong role - redirect to fallback
      if (role && !allowedRoles.includes(role as UserRole)) {
        router.push(fallbackPath);
        return;
      }
    }
  }, [user, role, isLoading, isInitialized, router, allowedRoles, fallbackPath]);

  // Show loading state
  if (!isInitialized || isLoading) {
    return <></>;
  }

  // Show nothing if not authenticated
  if (!user) {
    return <></>;
  }

  // Show nothing if wrong role
  if (role && !allowedRoles.includes(role as UserRole)) {
    return <></>;
  }

  return <>{children}</>;
};

export default RoleBasedPage;
export type { UserRole };