'use client';

import { type ReactNode } from 'react';

import { useInitializeStores } from '@/hooks/useInitializeStores';
import { getQueryClient } from '@/plugins/react-query/client';
import { QueryClientProvider } from '@tanstack/react-query';

function StoreInitializer() {
  useInitializeStores();
  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <StoreInitializer />
      {children}
    </QueryClientProvider>
  );
}
