import { FC, memo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: FC<PaginationProps> = memo(({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex justify-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="rounded bg-gray-200 px-3 py-1 disabled:opacity-50"
      >
        &laquo;
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={`page-${page}`}
          onClick={() => onPageChange(page)}
          className={`rounded px-3 py-1 ${currentPage === page ? 'bg-tanakayu-highlight text-white' : 'bg-gray-200'}`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="rounded bg-gray-200 px-3 py-1 disabled:opacity-50"
      >
        &raquo;
      </button>
    </div>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
