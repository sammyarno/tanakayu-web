import { Skeleton } from '@/components/ui/skeleton';

interface ListSkeletonProps {
  rows?: number;
  leading?: 'avatar' | 'checkbox' | 'none';
  actions?: number;
  /** Set false when the parent CardContent already has its own horizontal padding. */
  padded?: boolean;
}

/** Matches the avatar/checkbox + two-line + icon-button row shape used by Members and Waitlist. */
const ListSkeleton = ({ rows = 4, leading = 'avatar', actions = 1, padded = true }: ListSkeletonProps) => (
  <div className="divide-y">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className={`flex items-center gap-3 py-3 ${padded ? 'px-4 sm:px-6' : ''}`}>
        {leading === 'avatar' && <Skeleton className="bg-tanakayu-dark/10 h-10 w-10 shrink-0 rounded-full" />}
        {leading === 'checkbox' && <Skeleton className="bg-tanakayu-dark/10 h-4 w-4 shrink-0 rounded-sm" />}
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="bg-tanakayu-dark/10 h-3.5 w-2/5" />
          <Skeleton className="bg-tanakayu-dark/10 h-3 w-3/5" />
        </div>
        {Array.from({ length: actions }).map((_, j) => (
          <Skeleton key={j} className="bg-tanakayu-dark/10 h-8 w-8 shrink-0 rounded-md" />
        ))}
      </div>
    ))}
  </div>
);

export default ListSkeleton;
