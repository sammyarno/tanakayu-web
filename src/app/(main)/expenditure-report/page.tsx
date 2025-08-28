'use client';

import Image from 'next/image';

import Breadcrumb from '@/components/Breadcrumb';
import PageContent from '@/components/PageContent';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FinancialReport = () => {
  const renderTransactions = () => {
    return (
      <Accordion type="single" collapsible className="space-y-5">
        <AccordionItem value="072025">
          <AccordionTrigger>
            <h4 className="text-xl font-bold">Juli 2025</h4>
          </AccordionTrigger>
          <AccordionContent>
            <div className="relative h-96 w-full">
              <Image src="/expenditure.jpg" alt="expenditure-report" fill />
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="082025">
          <AccordionTrigger>
            <h4 className="text-xl font-bold">Agustus 2025</h4>
          </AccordionTrigger>
          <AccordionContent>
            <div className="relative h-96 w-full">
              <Image src="/expenditure.jpg" alt="expenditure-report" fill />
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="098025">
          <AccordionTrigger>
            <h4 className="text-xl font-bold">September 2025</h4>
          </AccordionTrigger>
          <AccordionContent>
            <div className="relative h-96 w-full">
              <Image src="/expenditure.jpg" alt="expenditure-report" fill />
            </div>
          </AccordionContent>
        </AccordionItem>
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
        {/* <LoadingIndicator isLoading={isLoading} /> */}
        {renderTransactions()}
      </section>
    </PageContent>
  );
};

export default FinancialReport;
