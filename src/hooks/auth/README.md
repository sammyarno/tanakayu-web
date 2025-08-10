# Authentication Hooks

This directory contains React hooks for handling authentication.

## Hooks Overview

### `useAuth`
The main authentication hook that provides access to user data and authentication methods from the Zustand store.

```tsx
import { useAuth } from '@/hooks/auth/useAuth';

const MyComponent = () => {
  const { user, isLoading, signIn, signOut, error } = useAuth();
  
  // Use authentication state and methods
};
```

## Simplified Authentication Flow

The following hooks have been **removed** and replaced with a simplified authentication utility:

- ~~`useRefreshToken`~~ - Removed
- ~~`useAutoRefreshToken`~~ - Removed  
- ~~`useAuthenticatedFetch`~~ - Removed

### New Approach: `authenticatedFetch` Utility

Instead of using hooks, use the `authenticatedFetch` utility from `@/utils/authenticatedFetch`:

```tsx
import { authenticatedFetch, authenticatedFetchJson } from '@/utils/authenticatedFetch';

// For JSON responses
const { data, error } = await authenticatedFetchJson('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(payload)
});

// For custom response handling
const response = await authenticatedFetch('/api/endpoint', options);
```

This utility automatically:
- Includes JWT tokens in requests
- Handles token refresh on 401 responses
- Signs out and redirects on refresh failure