import type { Category } from '@/types';

interface Props {
  categories: Category[];
  selectedCategory: string;
  onSelect: (value: string) => void;
}

const CategoryFilter = ({ categories, selectedCategory, onSelect }: Props) => {
  return (
    <section className="flex items-center gap-2">
      {categories.map((cat, index) => (
        <div
          key={`${cat.code}-${index}`}
          onClick={() => onSelect(cat.code)}
          className={`cursor-pointer rounded border px-2 py-1 text-sm tracking-wide ${
            selectedCategory === cat.code ? 'bg-tanakayu-dark text-tanakayu-accent' : 'bg-tanakayu-light'
          }`}
        >
          {cat.label}
        </div>
      ))}
    </section>
  );
};

export default CategoryFilter;
