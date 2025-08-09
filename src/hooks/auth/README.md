# Authentication Hooks

This directory contains React hooks for handling authentication, including JWT token management and automatic token refresh functionality.

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

### `useRefreshToken`
A basic hook for manually refreshing JWT tokens using the `/api/auth/refresh` endpoint.

```tsx
import { useRefreshToken } from '@/hooks/auth/useRefreshToken';

const MyComponent = () => {
  const { refreshToken, isRefreshing, error } = useRefreshToken();
  
  const handleRefresh = async () => {
    const result = await refreshToken(currentJwt);
    if (result) {
      console.log('New JWT:', result.jwt);
    }
  };
};
```

### `useAutoRefreshToken`
An advanced hook that automatically handles token refresh when API calls return 401 (Unauthorized) responses.

```tsx
import { useAutoRefreshToken } from '@/hooks/auth/useAutoRefreshToken';

const MyComponent = () => {
  const { fetchWithAutoRefresh, fetchJsonWithAutoRefresh } = useAutoRefreshToken({
    maxRetries: 1,
    onTokenRefreshed: (newToken) => {
      console.log('Token refreshed:', newToken);
    },
    onRefreshFailed: (error) => {
      console.error('Refresh failed:', error);
      // Handle refresh failure (e.g., redirect to login)
    },
  });
  
  const fetchUserData = async () => {
    const { data, error } = await fetchJsonWithAutoRefresh(
      '/api/auth/user',
      { method: 'GET' },
      currentJwt
    );
  };
};
```

### `useAuthenticatedFetch`
A practical wrapper around `useAutoRefreshToken` that provides a simple authenticated fetch function.

```tsx
import { useAuthenticatedFetch } from '@/hooks/auth/useAuthenticatedFetch';

const MyComponent = () => {
  const { authenticatedFetch, isRefreshing } = useAuthenticatedFetch();
  
  const fetchProtectedData = async () => {
    const { data, error } = await authenticatedFetch('/api/protected-endpoint');
    if (data) {
      console.log('Protected data:', data);
    }
  };
};
```

## Token Refresh Flow

1. **Initial Request**: Make an API call with the current JWT token
2. **401 Response**: If the server returns 401 (Unauthorized), the hook automatically:
   - Calls `/api/auth/refresh` with the HttpOnly refresh token cookie
   - Receives a new JWT token
   - Retries the original request with the new token
3. **Success/Failure**: Either returns the successful response or handles refresh failure

## Security Features

- **HttpOnly Cookies**: Refresh tokens are stored as HttpOnly cookies, preventing XSS attacks
- **Automatic Cleanup**: Expired refresh tokens are automatically cleaned up
- **Retry Limits**: Configurable retry limits prevent infinite refresh loops
- **Error Handling**: Comprehensive error handling with callbacks for custom logic

## Configuration

The `useAutoRefreshToken` hook accepts a configuration object:

```tsx
interface AutoRefreshConfig {
  maxRetries?: number; // Default: 1
  onTokenRefreshed?: (newToken: string) => void;
  onRefreshFailed?: (error: string) => void;
}
```

## Integration with Auth Store

These hooks work seamlessly with the existing `userAuthStore` Zustand store. The refresh functionality is designed to complement the current authentication flow without requiring major changes to existing code.

## Error Handling

All hooks provide error states and callbacks for handling various failure scenarios:

- Network errors
- Invalid refresh tokens
- Server errors
- Token expiration

## Best Practices

1. **Use `useAuthenticatedFetch`** for most API calls that require authentication
2. **Handle refresh failures** by redirecting users to the login page
3. **Store new tokens** when `onTokenRefreshed` is called (if needed)
4. **Monitor `isRefreshing`** state to show loading indicators
5. **Set appropriate retry limits** to prevent infinite loops

## Example: Complete Integration

```tsx
import { useAuthenticatedFetch } from '@/hooks/auth/useAuthenticatedFetch';
import { useAuth } from '@/hooks/auth/useAuth';

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { authenticatedFetch, isRefreshing } = useAuthenticatedFetch();
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    const loadProfile = async () => {
      const { data, error } = await authenticatedFetch('/api/profile');
      
      if (error) {
        console.error('Failed to load profile:', error);
        return;
      }
      
      setProfile(data);
    };
    
    if (user) {
      loadProfile();
    }
  }, [user, authenticatedFetch]);
  
  if (isRefreshing) {
    return <div>Refreshing authentication...</div>;
  }
  
  return (
    <div>
      <h1>User Profile</h1>
      {profile && <pre>{JSON.stringify(profile, null, 2)}</pre>}
    </div>
  );
};
```