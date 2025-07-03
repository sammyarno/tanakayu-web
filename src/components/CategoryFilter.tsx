import type { FC } from 'react';

import { Category } from '@/types';

interface Props {
  categories: Category[];
  selectedCategory: string;
  onSelect: (value: string) => void;
}

const CategoryFilter: FC<Props> = ({ categories, selectedCategory, onSelect }) => {
  return (
    <section className="flex items-center gap-2">
      {categories.map((cat, index) => (
        <div
          key={`${cat.value}-${index}`}
          onClick={() => onSelect(cat.value)}
          className={`cursor-pointer rounded border px-2 py-1 text-sm tracking-wide ${
            selectedCategory === cat.value ? 'bg-tanakayu-dark text-tanakayu-accent' : 'bg-tanakayu-light'
          }`}
        >
          {cat.label}
        </div>
      ))}
    </section>
  );
};

export default CategoryFilter;
