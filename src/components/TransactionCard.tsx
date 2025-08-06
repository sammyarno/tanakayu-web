'use client';

import { TransactionsByDate } from '@/types';
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
          <p className={`font-serif ${dayTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(dayTotal).toLocaleString('id-ID')}
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
            </div>
            <div className="flex flex-[25%] items-start justify-end">
              <p
                className={`text-sm tracking-wider ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
              >
                {transaction.amount.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionCard;
