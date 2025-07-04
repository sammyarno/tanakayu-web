'use client';

import { useState } from 'react';

import { HydrationBoundary, QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function HydrateClient({ state, children }: any) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}
