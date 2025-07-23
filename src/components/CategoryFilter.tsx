import type { Category } from '@/types';

import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

interface Props {
  categories: Category[];
  selectedCategory: string;
  onSelect: (value: string) => void;
}

const CategoryFilter = ({ categories, selectedCategory, onSelect }: Props) => {
  return (
    <section className="flex items-center gap-2">
      {categories.length === 0 && (
        <>
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-7 w-28" />
        </>
      )}
      {categories.map((cat, index) => (
        <Badge
          key={`${cat.code}-${index}`}
          onClick={() => onSelect(cat.code)}
          variant={selectedCategory === cat.code ? 'default' : 'secondary'}
          className="text-sm tracking-wide"
        >
          {cat.label}
        </Badge>
      ))}
    </section>
  );
};

export default CategoryFilter;
