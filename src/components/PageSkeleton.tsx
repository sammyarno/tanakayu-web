import { Skeleton } from '@/components/ui/skeleton';

interface PageSkeletonProps {
  /** How many content blocks to outline below the header. */
  rows?: number;
}

/**
 * Shown by each route's loading.tsx while the server resolves the navigation,
 * so a click paints something immediately instead of sitting on the old page.
 */
const PageSkeleton = ({ rows = 3 }: PageSkeletonProps) => {
  return (
    <main className="flex w-full flex-col gap-6 py-4">
      {/* breadcrumb */}
      <Skeleton className="h-4 w-48" />

      {/* page header: icon badge + title/description */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-3.5 w-64" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </main>
  );
};

export default PageSkeleton;
