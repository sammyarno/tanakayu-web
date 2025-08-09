'use client';

import { ReactNode, useState } from 'react';

import { useInitializeStores } from '@/hooks/useInitializeStores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function StoreInitializer() {
  useInitializeStores();
  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StoreInitializer />
      {children}
    </QueryClientProvider>
  );
}
