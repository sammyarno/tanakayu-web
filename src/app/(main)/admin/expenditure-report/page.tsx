'use client';

import { useState } from 'react';

import Image from 'next/image';

import Breadcrumb from '@/components/Breadcrumb';
import LoadingIndicator from '@/components/LoadingIndicator';
import PageContent from '@/components/PageContent';
import { Button } from '@/components/ui/button';
import { useFetchExpenditures } from '@/hooks/useFetchExpenditures';
import { formatDate } from '@/utils/date';
import dayjs from 'dayjs';
import { CalendarIcon, EditIcon, PlusIcon } from 'lucide-react';

import CreateDialog from './CreateDialog';
import UpdateDialog from './UpdateDialog';

const ExpenditureReportAdmin = () => {
  const [selectedExpenditure, setSelectedExpenditure] = useState<any>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const { data: expenditures, isLoading } = useFetchExpenditures();

  const handleEdit = (expenditure: any) => {
    setSelectedExpenditure(expenditure);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateDialogClose = () => {
    setIsUpdateDialogOpen(false);
    setSelectedExpenditure(null);
  };

  const renderExpenditures = () => {
    if (!expenditures || expenditures.length === 0) {
      return (
        <div className="flex justify-center py-8">
          <p className="text-gray-500">No expenditure reports found</p>
        </div>
      );
    }

    return expenditures.map(expenditure => (
      <div key={expenditure.id} className="border-tanakayu-accent rounded border p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="flex items-center text-lg font-semibold">
              <CalendarIcon className="text-tanaka-highlight mr-2 h-5 w-5" />
              {dayjs(expenditure.date).format('MMMM YYYY')}
            </h2>
            <p className="mb-2 text-xs text-gray-600">
               {expenditure.createdBy} | {formatDate(expenditure.createdAt)}
             </p>
          </div>
          <div className="ml-2 flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(expenditure)}
              className="flex items-center gap-1"
            >
              <EditIcon className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-3">{expenditure.description}</p>
        <div className="relative h-96 w-full overflow-hidden rounded-lg">
          <Image
             src={expenditure.imagePath}
             alt={`Expenditure report for ${dayjs(expenditure.date).format('MMMM YYYY')}`}
             fill
             className="object-contain"
           />
        </div>
        {expenditure.modifiedAt && (
           <div className="mt-3 text-xs text-gray-500">
             <p>Last modified: {formatDate(expenditure.modifiedAt)}</p>
           </div>
         )}
      </div>
    ));
  };

  return (
    <PageContent allowedRoles={['ADMIN']}>
      <Breadcrumb
        items={[
          { label: 'Home', link: '/admin' },
          { label: 'Laporan Keuangan', link: '/admin/expenditure-report' },
        ]}
      />
      <section id="menu" className="flex flex-col gap-4">
        <h2 className="font-sans text-3xl font-bold uppercase">💸 Laporan Keuangan</h2>
        <div className="flex w-full items-center gap-2">
          <CreateDialog />
        </div>
        <hr />
      </section>
      <section className="flex flex-col gap-4">
        <LoadingIndicator isLoading={isLoading} />
        <div className="space-y-4">{renderExpenditures()}</div>
      </section>

      {/* Update Dialog */}
      {selectedExpenditure && (
        <UpdateDialog expenditure={selectedExpenditure} isOpen={isUpdateDialogOpen} onClose={handleUpdateDialogClose} />
      )}
    </PageContent>
  );
};

export default ExpenditureReportAdmin;
