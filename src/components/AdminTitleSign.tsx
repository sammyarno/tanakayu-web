'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useFetchLoggedUser } from '@/hooks/auth/useFetchLoggedUser';

const AdminTitleSign = () => {
  const { data } = useFetchLoggedUser();

  return (
    <h1 className="flex w-full items-center justify-center text-center text-xl font-bold">
      Welcome back, {data ? data.email : <Skeleton className="h-7 w-36" />}!
    </h1>
  );
};

export default AdminTitleSign;
