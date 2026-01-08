'use client';

import { usePathname } from 'next/navigation';

import { Footer } from './Footer';

export const GlobalFooter = () => {
  const pathname = usePathname();
  const isMemberPage = pathname?.startsWith('/member');

  if (isMemberPage) {
    return null;
  }

  return <Footer />;
};
