'use client';

import { type ReactNode, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useAuthInitialized, useUserAuthStore } from '@/store/userAuthStore';

const PrivatePage = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useUserAuthStore();
  const isInitialized = useAuthInitialized();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !user && !isLoading) {
      console.log('privatePage', isInitialized, user, isLoading);
      router.push('/login');
    }
  }, [user, isLoading, isInitialized, router]);

  if (!isInitialized || isLoading || (!user && isInitialized)) return <></>;

  return children;
};

export default PrivatePage;
