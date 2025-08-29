'use client';

import Image from 'next/image';

import Breadcrumb from '@/components/Breadcrumb';
import LoadingIndicator from '@/components/LoadingIndicator';
import PageContent from '@/components/PageContent';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useFetchExpenditures } from '@/hooks/useFetchExpenditures';
import dayjs from 'dayjs';

const ExpenditureReport = () => {
  const { data: expenditures, isLoading, error } = useFetchExpenditures();

  const renderTransactions = () => {
    if (!expenditures || expenditures.length === 0) {
      return (
        <div className="py-8 text-center">
          <p className="text-gray-500">No expenditure reports available.</p>
        </div>
      );
    }

    return (
      <Accordion type="single" collapsible className="space-y-5">
        {expenditures.map(expenditure => {
          const monthYear = dayjs(expenditure.date).format('MMMM YYYY');
          const accordionValue = dayjs(expenditure.date).format('MMYYYY');

          return (
            <AccordionItem key={expenditure.id} value={accordionValue}>
              <AccordionTrigger className="items-center">
                <div className="flex flex-col items-start">
                  <h4 className="text-xl font-bold">{monthYear}</h4>
                  {expenditure.description && <p className="mt-1 text-sm text-gray-600">{expenditure.description}</p>}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="relative h-96 w-full">
                  <Image
                    src={expenditure.imagePath}
                    alt={`Expenditure report for ${monthYear}`}
                    fill
                    className="object-contain"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
  };

  return (
    <PageContent>
      <Breadcrumb
        items={[
          { label: 'Home', link: '/' },
          { label: 'Laporan Keuangan', link: '/expenditure-report' },
        ]}
      />
      <section id="menu" className="flex flex-col gap-4">
        <h2 className="font-sans text-3xl font-bold uppercase">💸 Laporan Keuangan</h2>
      </section>
      <section className="flex flex-col gap-4">
        <LoadingIndicator isLoading={isLoading} />
        {error && (
          <div className="py-8 text-center">
            <p className="text-red-500">Failed to load expenditure reports. Please try again later.</p>
          </div>
        )}
        {!isLoading && !error && renderTransactions()}
      </section>
    </PageContent>
  );
};

export default ExpenditureReport;
