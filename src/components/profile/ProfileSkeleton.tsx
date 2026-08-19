import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/** Matches ProfileHeader + PersonalInfoSection + ChangePasswordSection + SignOutSection. */
const ProfileSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardContent className="flex flex-col items-center gap-2 text-center">
        <Skeleton className="bg-tanakayu-dark/10 size-20 rounded-full" />
        <Skeleton className="bg-tanakayu-dark/10 mt-2 h-5 w-32" />
        <Skeleton className="bg-tanakayu-dark/10 h-3.5 w-24" />
        <Skeleton className="bg-tanakayu-dark/10 mt-1 h-5 w-20 rounded-full" />
      </CardContent>
    </Card>

    <Card>
      <CardContent className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="bg-tanakayu-dark/10 h-4 w-4 shrink-0 rounded-full" />
            <Skeleton className="bg-tanakayu-dark/10 h-4 w-full max-w-56" />
          </div>
        ))}
      </CardContent>
    </Card>

    <Card>
      <CardContent>
        <Skeleton className="bg-tanakayu-dark/10 h-9 w-full rounded-md" />
      </CardContent>
    </Card>
  </div>
);

export default ProfileSkeleton;
