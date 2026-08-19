import Breadcrumb from '@/components/Breadcrumb';
import PageHeader from '@/components/PageHeader';
import TransactionCardSkeleton from '@/components/TransactionCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { ReceiptText } from 'lucide-react';

const Loading = () => (
  <main className="flex w-full flex-col gap-6 py-4">
    <Breadcrumb
      items={[
        { label: 'Home', link: '/' },
        { label: 'Transaction Report', link: '/transaction-report' },
      ]}
    />

    <PageHeader icon={ReceiptText} title="Transaction Report" description="View financial transactions for your community." />

    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-11 w-11 shrink-0 rounded-md" />
        <Skeleton className="h-11 flex-1 rounded-md" />
        <Skeleton className="h-11 w-11 shrink-0 rounded-md" />
      </div>
      <hr />

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-tanakayu-accent text-xs tracking-wider">Balance Start</p>
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="text-tanakayu-accent text-right text-xs tracking-wider">Balance End</p>
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
    </section>

    <section className="flex flex-col gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <TransactionCardSkeleton key={i} />
      ))}
    </section>
  </main>
);

export default Loading;
