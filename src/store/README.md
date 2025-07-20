# Zustand Store Implementation

## Overview

This directory contains Zustand stores for state management across the application. Zustand provides a lightweight, fast, and scalable state management solution with minimal boilerplate.

## Stores

### AnnouncementCategoriesStore

The `announcementCategoriesStore.ts` implements a store for managing announcement categories with the following features:

- **Data Fetching**: Automatically fetches categories from Supabase
- **Caching**: Implements a 5-minute cache to prevent unnecessary API calls
- **Persistence**: Stores data in localStorage to survive page refreshes
- **Loading States**: Tracks loading and error states
- **Helper Methods**: Provides utility functions like `getCategoryOptions()` for UI components

## Usage Examples

### Basic Usage

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