import { Skeleton } from '@/components/ui/skeleton';

/** Matches PostCard's shape: badge, title/meta, two content lines, vote pills. */
const PostCardSkeleton = () => (
  <div className="border-tanakayu-accent flex flex-col items-start gap-3 rounded border bg-white p-3">
    <Skeleton className="bg-tanakayu-dark/10 h-6 w-20 rounded-full" />
    <div className="w-full space-y-1.5">
      <Skeleton className="bg-tanakayu-dark/10 h-5 w-3/4" />
      <Skeleton className="bg-tanakayu-dark/10 h-3 w-1/3" />
    </div>
    <div className="w-full space-y-1.5">
      <Skeleton className="bg-tanakayu-dark/10 h-3.5 w-full" />
      <Skeleton className="bg-tanakayu-dark/10 h-3.5 w-4/5" />
    </div>
    <hr className="w-full" />
    <div className="flex gap-3">
      <Skeleton className="bg-tanakayu-dark/10 h-7 w-14 rounded-full" />
      <Skeleton className="bg-tanakayu-dark/10 h-7 w-14 rounded-full" />
    </div>
  </div>
);

export default PostCardSkeleton;
