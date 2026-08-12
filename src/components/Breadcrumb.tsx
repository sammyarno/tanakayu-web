import Link from 'next/link';

import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  link: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav aria-label="breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <li key={item.link} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className="text-tanakayu-text flex items-center gap-1 font-semibold">
                  {isFirst && <Home className="h-3.5 w-3.5" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.link}
                  className="text-tanakayu-text/70 hover:text-tanakayu-text flex items-center gap-1 py-1 transition-colors hover:underline"
                >
                  {isFirst && <Home className="h-3.5 w-3.5" />}
                  {item.label}
                </Link>
              )}
              {!isLast && <ChevronRight className="text-tanakayu-text/40 h-3.5 w-3.5" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
