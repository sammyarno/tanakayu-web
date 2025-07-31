'use client';

import { useState } from 'react';

import Breadcrumb from '@/components/Breadcrumb';
import LoadingIndicator from '@/components/LoadingIndicator';
import PageContent from '@/components/PageContent';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFetchTransactions } from '@/hooks/useFetchTransactions';
import { formatCurrencyToIDR } from '@/utils/currency';
import { formatDateForTransaction } from '@/utils/date';

const FinancialReport = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>();
  const { data: transactionsData, isLoading } = useFetchTransactions(selectedPeriod);

  return (
    <PageContent>
      <Breadcrumb
        items={[
          { label: 'Home', link: '/' },
          { label: 'Laporan Keuangan', link: '/financial-report' },
        ]}
      />
      <section id="menu" className="flex flex-col gap-4">
        <h2 className="font-sans text-3xl font-bold uppercase">💰 Laporan Keuangan</h2>
        <div className="flex items-center">
          <div className="relative h-full w-[200px]">
            <Select onValueChange={setSelectedPeriod}>
              <SelectTrigger className="h-full flex-3/5">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="012025">January 2025</SelectItem>
                <SelectItem value="022025">February 2025</SelectItem>
                <SelectItem value="032025">March 2025</SelectItem>
                <SelectItem value="042025">April 2025</SelectItem>
                <SelectItem value="052025">May 2025</SelectItem>
                <SelectItem value="062025">June 2025</SelectItem>
                <SelectItem value="072025">July 2025</SelectItem>
                <SelectItem value="082025">August 2025</SelectItem>
                <SelectItem value="092025">September 2025</SelectItem>
                <SelectItem value="102025">October 2025</SelectItem>
                <SelectItem value="112025">November 2025</SelectItem>
                <SelectItem value="122025">December 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-2/5 flex-col">
            <p className="text-right text-sm">Saldo</p>
            <p className="text-right font-bold">
              {isLoading ? 'Loading...' : transactionsData ? formatCurrencyToIDR(transactionsData.balance) : 'IDR 0'}
            </p>
          </div>
        </div>
        <hr />
      </section>
      <section className="flex flex-col gap-4">
        <LoadingIndicator isLoading={isLoading} />
        {transactionsData && transactionsData.transactions.length === 0 && (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">No transactions found for the selected period</p>
          </div>
        )}
        {transactionsData?.transactions.map(dayGroup => {
          const { day, dayName, monthYear } = formatDateForTransaction(dayGroup.date);
          const dayTotal = dayGroup.transactions.reduce((sum, transaction) => {
            return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
          }, 0);

          return (
            <div
              key={dayGroup.date}
              className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 shadow-lg"
            >
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
                {dayGroup.transactions.map(transaction => (
                  <div key={transaction.id} className="flex items-stretch py-1">
                    <div className="flex flex-[75%] flex-col">
                      <p className="mb-1 text-sm font-bold capitalize">{transaction.category}</p>
                      <p className="text-sm">{transaction.title}</p>
                      {transaction.description && <p className="text-xs text-gray-500">{transaction.description}</p>}
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
        })}
      </section>
    </PageContent>
  );
};

export default FinancialReport;
