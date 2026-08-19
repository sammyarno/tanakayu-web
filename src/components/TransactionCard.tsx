'use client';

import { Skeleton } from '@/components/ui/skeleton';
import type { TransactionsByDate } from '@/types/transaction';
import { formatNumberID } from '@/utils/currency';
import { formatDateForTransaction } from '@/utils/date';

interface TransactionCardProps {
  dayGroup: TransactionsByDate;
}

const TransactionCard = ({ dayGroup }: TransactionCardProps) => {
  const { day, dayName, monthYear } = formatDateForTransaction(dayGroup.date);
  const dayTotal = dayGroup.details.reduce((sum, transaction) => {
    return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
  }, 0);

  return (
    <div key={dayGroup.date} className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 shadow-lg">
      {/* header */}
      <div className="flex w-full items-stretch border-b-2 pb-2">
        <div className="flex flex-[12.5%] items-center justify-start">
          <h4 className="text-4xl font-bold">{day.toString().padStart(2, '0')}</h4>
        </div>
        <div className="flex flex-[62.5%] flex-col">
          <p className="text-sm text-stone-600">{dayName}</p>
          <p className="text-sm text-stone-600">{monthYear}</p>
        </div>
        <div className="flex flex-[25%] items-center justify-end">
          <p className={`tracking-wider ${dayTotal >= 0 ? 'text-tanakayu-moss' : 'text-red-600'}`}>
            {formatNumberID(Math.abs(dayTotal))}
          </p>
        </div>
      </div>
      {/* items */}
      <div className="flex flex-col items-stretch justify-center gap-2 pt-2">
        {dayGroup.details.map(transaction => (
          <div key={transaction.id} className="flex items-stretch py-1">
            <div className="flex flex-[75%] flex-col">
              <p className="text-muted-foreground text-xs capitalize">{transaction.category}</p>
              <p className="text-sm">{transaction.title}</p>
              <p className="text-muted-foreground text-xs">{transaction.description}</p>
            </div>
            <div className="flex flex-[25%] items-start justify-end">
              <p className={`text-sm ${transaction.type === 'income' ? 'text-tanakayu-moss' : 'text-red-600'}`}>
                {formatNumberID(transaction.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Matches TransactionCard's shape: day header + a couple of item rows. */
export const TransactionCardSkeleton = () => (
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

export default TransactionCard;
