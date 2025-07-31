'use client';

import { HydrationBoundary } from '@tanstack/react-query';

export default function HydrateClient({ state, children }: any) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}
