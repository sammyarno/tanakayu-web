import { QueryClient, isServer } from '@tanstack/react-query';

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

let browserClient: QueryClient | null = null;

export const getQueryClient = () => {
  // On the server, always hand back a fresh client. A module-level singleton is
  // shared across concurrent requests during SSR, which leaks one user's cached
  // query data into another user's render.
  if (isServer) return makeQueryClient();

  if (!browserClient) {
    browserClient = makeQueryClient();
  }
  return browserClient;
};
