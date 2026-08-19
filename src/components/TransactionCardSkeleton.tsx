import { Skeleton } from '@/components/ui/skeleton';

/** Matches TransactionCard's shape: day header + a couple of item rows. */
const TransactionCardSkeleton = () => (
  <div className="border-tanakayu-accent rounded border bg-white p-3 shadow-lg">
    <div className="flex w-full items-stretch gap-3 border-b-2 pb-2">
      <Skeleton className="bg-tanakayu-dark/10 h-9 w-9 shrink-0 rounded" />
      <div className="flex flex-1 flex-col justify-center gap-1.5">
        <Skeleton className="bg-tanakayu-dark/10 h-3 w-20" />
        <Skeleton className="bg-tanakayu-dark/10 h-3 w-16" />
      </div>
      <Skeleton className="bg-tanakayu-dark/10 h-4 w-16 self-center" />
    </div>
    <div className="flex flex-col gap-3 pt-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="bg-tanakayu-dark/10 h-2.5 w-16" />
            <Skeleton className="bg-tanakayu-dark/10 h-3.5 w-2/5" />
          </div>
          <Skeleton className="bg-tanakayu-dark/10 h-3.5 w-14" />
        </div>
      ))}
    </div>
  </div>
);

export default TransactionCardSkeleton;
