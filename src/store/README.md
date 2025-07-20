# Zustand Store Implementation

## Overview

This directory contains Zustand stores for state management across the application. Zustand provides a lightweight, fast, and scalable state management solution with minimal boilerplate.

## Stores

### UserAuthStore

The `userAuthStore.ts` implements a store for managing user authentication with the following features:

- **User Management**: Stores and provides access to the authenticated user
- **Authentication Actions**: Provides signIn, signOut, and fetchUser methods
- **Caching**: Implements a 5-minute cache to prevent unnecessary API calls
- **Persistence**: Stores user data in localStorage to survive page refreshes
- **Loading States**: Tracks loading and error states

### AnnouncementCategoriesStore

The `announcementCategoriesStore.ts` implements a store for managing announcement categories with the following features:

- **Data Fetching**: Automatically fetches categories from Supabase
- **Caching**: Implements a 5-minute cache to prevent unnecessary API calls
- **Persistence**: Stores data in localStorage to survive page refreshes
- **Loading States**: Tracks loading and error states
- **Helper Methods**: Provides utility functions like `getCategoryOptions()` for UI components

## Usage Examples

### User Authentication

```tsx
import { useUserAuthStore } from '@/store/userAuthStore';

const LoginComponent = () => {
  const { signIn, isLoading, error } = useUserAuthStore();
  
  const handleLogin = async (email, password) => {
    await signIn(email, password);
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const email = e.target.email.value;
      const password = e.target.password.value;
      handleLogin(email, password);
    }}>
      {error && <div>Error: {error}</div>}
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button type="submit" disabled={isLoading}>Login</button>
    </form>
  );
};

const ProfileComponent = () => {
  const { user, signOut } = useUserAuthStore();
  
  if (!user) return <div>Not logged in</div>;
  
  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};
```

### Announcement Categories Usage

```tsx
import { useAnnouncementCategories } from '@/store/announcementCategoriesStore';

const MyComponent = () => {
  const { categories, isLoading, error, fetchCategories } = useAnnouncementCategories();
  
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {categories.map(category => (
        <div key={category.id}>{category.label}</div>
      ))}
    </div>
  );
};
```

### Using with MultiSelect

```tsx
import { useAnnouncementCategories } from '@/store/announcementCategoriesStore';
import { MultiSelect } from '@/components/ui/multi-select';

const CategorySelector = () => {
  const { getCategoryOptions, fetchCategories } = useAnnouncementCategories();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  return (
    <MultiSelect
      options={getCategoryOptions()}
      value={selectedCategories}
      onValueChange={setSelectedCategories}
    />
  );
};
```

## Performance Considerations

- The store implements caching to minimize API calls
- Only the necessary data is persisted to localStorage
- Components can selectively subscribe to only the parts of the state they need
- The store handles loading and error states to simplify component logic

## Migration from React Query

This store replaces the previous React Query implementation in `useFetchAnnouncementCategories.ts`. The main advantages are:

1. **Global State**: Data is now available across components without prop drilling
2. **Persistence**: Data survives page refreshes
3. **Simpler API**: Components have a more straightforward API to work with
4. **Reduced Network Calls**: Better caching strategy reduces API calls

## Future Improvements

- Add synchronization between tabs using Zustand's broadcast channel middleware
- Implement optimistic updates for write operations
- Add devtools integration for debugging
- Enhance security for the user authentication store
- Add refresh token handling for the authentication store