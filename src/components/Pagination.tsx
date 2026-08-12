import { FC, memo } from 'react';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: FC<PaginationProps> = memo(({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="icon-lg"
        aria-label="Previous page"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="bg-tanakayu-dark text-tanakayu-highlight border-tanakayu-dark hover:bg-tanakayu-dark hover:opacity-90 h-11 w-11"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <span className="text-tanakayu-text text-sm">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="icon-lg"
        aria-label="Next page"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="bg-tanakayu-dark text-tanakayu-highlight border-tanakayu-dark hover:bg-tanakayu-dark hover:opacity-90 h-11 w-11"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
