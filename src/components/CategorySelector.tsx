import { useEffect, useState } from 'react';

import { useAnnouncementCategories } from '@/store/announcementCategoriesStore';

import { Label } from './ui/label';
import { MultiSelect } from './ui/multi-select';

interface CategorySelectorProps {
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  label?: string;
  name?: string;
  disabled?: boolean;
}

/**
 * A reusable category selector component that uses the Zustand store
 * for fetching and displaying announcement categories.
 */
const CategorySelector = ({
  defaultValue = [],
  onValueChange,
  label = 'Category',
  name = 'category',
  disabled = false,
}: CategorySelectorProps) => {
  const { getCategoryOptions, fetchCategories, isLoading } = useAnnouncementCategories();
  const [value, setValue] = useState<string[]>(defaultValue);

  // Fetch categories when component mounts if needed
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleValueChange = (newValue: string[]) => {
    setValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div className="grid gap-3">
      <Label htmlFor={name}>{label}</Label>
      <MultiSelect
        id={name}
        name={name}
        options={getCategoryOptions()}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        disabled={isLoading || disabled}
      />
    </div>
  );
};

export default CategorySelector;
