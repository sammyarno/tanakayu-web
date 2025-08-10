'use client';

import { type ReactNode, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/auth/useAuth';

const PrivatePage = ({ children }: { children: ReactNode }) => {
  const { user, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !user && !isLoading) {
      router.push('/login');
    }
  }, [user, isLoading, isInitialized, router]);

  console.log('PrivatePage', { user, isLoading, isInitialized });

  if (!isInitialized || isLoading || (!user && isInitialized)) return <></>;

  return children;
};

export default PrivatePage;
