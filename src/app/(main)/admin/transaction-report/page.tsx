'use client';

import { useState } from 'react';

import dynamic from 'next/dynamic';

import Breadcrumb from '@/components/Breadcrumb';
import LoadingIndicator from '@/components/LoadingIndicator';
import PageContent from '@/components/PageContent';
import TransactionCard from '@/components/TransactionCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFetchTransactionDateRange } from '@/hooks/useFetchTransactionDateRange';
import { useFetchTransactions } from '@/hooks/useFetchTransactions';
import { formatCurrencyToIDR } from '@/utils/currency';
import { exportTransactionsToExcel } from '@/utils/exportTransactions';
import { Download, RefreshCw } from 'lucide-react';

const CreateTransactionDialog = dynamic(() => import('./CreateDialog'));
const UploadDialog = dynamic(() => import('./UploadDialog'));

const FinancialReport = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>();
  const { data: transactionsData, isLoading } = useFetchTransactions(selectedPeriod);
  const { monthOptions, isLoading: isLoadingDateRange, hasTransactions } = useFetchTransactionDateRange();

  const renderTransactions = () => {
    if (!transactionsData?.transactions || !Array.isArray(transactionsData.transactions)) {
      return null;
    }

    if (transactionsData.transactions.length === 0) {
      return (
        <div className="flex justify-center py-8">
          <p className="text-gray-500">No transactions found for the selected period</p>
        </div>
      );
    }

    return transactionsData.transactions.map(dayGroup => <TransactionCard key={dayGroup.date} dayGroup={dayGroup} />);
  };

  const handleResetFilter = () => {
    setSelectedPeriod('');
  };

  const selectedPeriodLabel = monthOptions.find(o => o.value === selectedPeriod)?.label ?? 'All';

  const handleDownloadExcel = async () => {
    if (!transactionsData) return;
    await exportTransactionsToExcel(transactionsData, selectedPeriodLabel, selectedPeriod || undefined);
  };

  return (
    <PageContent>
      <Breadcrumb
        items={[
          { label: 'Home', link: '/admin' },
          { label: 'Transaction Report', link: '/admin/transaction-report' },
        ]}
      />
      <section id="menu" className="flex flex-col gap-4">
        <h2 className="font-sans text-3xl font-bold uppercase">Transaction Report</h2>
        <div className="flex items-center">
          <div className="relative flex h-full flex-3/5 items-center justify-start gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="h-full flex-3/5">
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
            <Button variant="outline" onClick={handleResetFilter}>
              <RefreshCw />
            </Button>
          </div>
          <div className="flex flex-2/5 flex-col">
            <p className="text-right text-sm">Balance</p>
            <p className="text-right font-bold">
              {isLoading ? 'Loading...' : transactionsData ? formatCurrencyToIDR(transactionsData.balance) : 'IDR 0'}
            </p>
          </div>
        </div>
        <hr />
        <div className="flex w-full items-center gap-2">
          <UploadDialog />
          <CreateTransactionDialog />
          <Button variant="outline" onClick={handleDownloadExcel} disabled={!transactionsData?.transactions?.length}>
            <Download className="size-4" />
            <p className="leading-none">Download</p>
          </Button>
        </div>
        <hr />
      </section>
      <section className="flex flex-col gap-4">
        <LoadingIndicator isLoading={isLoading} />
        {renderTransactions()}
      </section>
    </PageContent>
  );
};

export default FinancialReport;
