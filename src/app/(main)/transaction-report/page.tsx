'use client';

import { useState } from 'react';

import dynamic from 'next/dynamic';

import Breadcrumb from '@/components/Breadcrumb';
import PageContent from '@/components/PageContent';
import PageHeader from '@/components/PageHeader';
import TransactionCard from '@/components/TransactionCard';
import TransactionCardSkeleton from '@/components/TransactionCardSkeleton';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ALL_ROLES, ROLES } from '@/constants/roles';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchTransactionDateRange } from '@/hooks/useFetchTransactionDateRange';
import { useFetchTransactions } from '@/hooks/useFetchTransactions';
import { formatCurrencyToIDR } from '@/utils/currency';
import { exportTransactionsToExcel } from '@/utils/exportTransactions';
import { ChevronLeft, ChevronRight, Download, ReceiptText } from 'lucide-react';

const CreateTransactionDialog = dynamic(() => import('@/components/transaction/CreateDialog'));
const UploadDialog = dynamic(() => import('@/components/transaction/UploadDialog'));

const FinancialReport = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>();
  const { monthOptions, isLoading: isLoadingDateRange, hasTransactions } = useFetchTransactionDateRange();
  // Both requests fire together on mount; the server resolves "latest" for us.
  const { data: transactionsData, isLoading } = useFetchTransactions(selectedPeriod);
  const { role } = useAuth();
  const isAdmin = role === ROLES.SUPERADMIN;

  // Until the user picks a month, show whichever one the server resolved.
  const activeMonth = selectedPeriod ?? transactionsData?.month ?? undefined;

  // monthOptions is sorted newest-first, so an older month is a higher index
  const currentMonthIndex = monthOptions.findIndex(o => o.value === activeMonth);
  const canGoToOlderMonth = currentMonthIndex !== -1 && currentMonthIndex < monthOptions.length - 1;
  const canGoToNewerMonth = currentMonthIndex > 0;

  const goToMonth = (value: string) => {
    setSelectedPeriod(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedPeriodLabel = monthOptions.find(o => o.value === activeMonth)?.label ?? 'All';

  const handleDownloadExcel = async () => {
    if (!transactionsData) return;
    await exportTransactionsToExcel(transactionsData, selectedPeriodLabel, activeMonth);
  };

  const renderTransactions = () => {
    if (!transactionsData?.transactions || !Array.isArray(transactionsData.transactions)) {
      return null;
    }

    if (transactionsData.transactions.length === 0) {
      return (
        <div className="flex justify-center py-8">
          <p className="text-tanakayu-text/60">No transactions found for the selected period</p>
        </div>
      );
    }

    return transactionsData.transactions.map(dayGroup => <TransactionCard key={dayGroup.date} dayGroup={dayGroup} />);
  };

  const breadcrumbItems = [
    { label: 'Home', link: '/' },
    { label: 'Transaction Report', link: '/transaction-report' },
  ];

  return (
    <PageContent allowedRoles={ALL_ROLES}>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        icon={ReceiptText}
        title="Transaction Report"
        description={
          isAdmin ? 'Manage and review financial transactions.' : 'View financial transactions for your community.'
        }
      />

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-lg"
            aria-label="Previous month"
            onClick={() => canGoToOlderMonth && goToMonth(monthOptions[currentMonthIndex + 1].value)}
            disabled={!canGoToOlderMonth}
            className="bg-tanakayu-dark text-tanakayu-highlight border-tanakayu-dark hover:bg-tanakayu-dark h-11 w-11 shrink-0 hover:opacity-90"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Select value={activeMonth} onValueChange={goToMonth}>
            <SelectTrigger className="bg-tanakayu-dark border-tanakayu-dark text-tanakayu-highlight !h-11 flex-1">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingDateRange ? (
                <SelectItem value="loading" disabled>
                  Loading periods...
                </SelectItem>
              ) : !hasTransactions ? (
                <SelectItem value="no-data" disabled>
                  No transactions found
                </SelectItem>
              ) : (
                monthOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon-lg"
            aria-label="Next month"
            onClick={() => canGoToNewerMonth && goToMonth(monthOptions[currentMonthIndex - 1].value)}
            disabled={!canGoToNewerMonth}
            className="bg-tanakayu-dark text-tanakayu-highlight border-tanakayu-dark hover:bg-tanakayu-dark h-11 w-11 shrink-0 hover:opacity-90"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <hr />

        {isAdmin && (
          <>
            <div className="flex w-full items-center gap-2">
              <UploadDialog />
              <CreateTransactionDialog />
              <Button
                variant="outline"
                onClick={handleDownloadExcel}
                disabled={!transactionsData?.transactions?.length}
              >
                <Download className="size-4" />
                <p className="leading-none">Download</p>
              </Button>
            </div>
            <hr />
          </>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-tanakayu-accent text-xs tracking-wider">Balance Start</p>
            {isLoading ? (
              <Skeleton className="h-5 w-28" />
            ) : (
              <p className="text-tanakayu-accent font-bold tracking-wide">
                {transactionsData ? formatCurrencyToIDR(transactionsData.balanceStart) : 'IDR 0'}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-tanakayu-accent text-right text-xs tracking-wider">Balance End</p>
            {isLoading ? (
              <Skeleton className="h-5 w-28" />
            ) : (
              <p className="text-tanakayu-accent text-right font-bold tracking-wide">
                {transactionsData ? formatCurrencyToIDR(transactionsData.balance) : 'IDR 0'}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => <TransactionCardSkeleton key={i} />)
          : renderTransactions()}
      </section>
    </PageContent>
  );
};

export default FinancialReport;
