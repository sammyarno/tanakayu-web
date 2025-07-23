'use client';

import { type ReactNode, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useUserAuthStore } from '@/store/userAuthStore';

const PrivatePage = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useUserAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user]);

  if (isLoading) return <></>;

  return children;
};

export default PrivatePage;
