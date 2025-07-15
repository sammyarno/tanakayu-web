'use client';

import Breadcrumb from '@/components/Breadcrumb';
import PageContent from '@/components/PageContent';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FinancialReport = () => {
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
            <Select onValueChange={value => console.log(value)}>
              <SelectTrigger className="h-full flex-3/5">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="012025">January 2025</SelectItem>
                <SelectItem value="022025">February 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-2/5 flex-col">
            <p className="text-right text-sm">Saldo</p>
            <p className="text-right font-bold">IDR 25.000.000</p>
          </div>
        </div>
        <hr />
        <div className="flex items-stretch justify-center">
          <div className="flex-1/2 text-center">
            <p className="text-sm">Saldo Awal</p>
            <p className="text-lg font-semibold">IDR 7.000.000</p>
          </div>
          <div className="flex-1/2 text-center">
            <p className="text-sm">Saldo Akhir</p>
            <p className="text-lg font-semibold">IDR 7.000.000</p>
          </div>
        </div>
        <hr />
        <div className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 shadow-lg">
          {/* header */}
          <div className="flex w-full items-stretch border-b-2 pb-2">
            <div className="flex flex-[12.5%] items-center justify-start">
              <h4 className="text-4xl font-bold">05</h4>
            </div>
            <div className="flex flex-[62.5%] flex-col">
              <p className="text-sm text-stone-600">Sunday</p>
              <p className="text-sm text-stone-600">July 2025</p>
            </div>
            <div className="flex flex-[25%] items-center justify-end">
              <p className="font-serif text-red-600">81,500</p>
            </div>
          </div>
          {/* items */}
          <div className="flex flex-col items-stretch justify-center gap-2 pt-2">
            <div className="flex items-stretch">
              <div className="flex flex-[75%] flex-col">
                <p className="text-base font-bold">Ayam Goreng Mba Ni</p>
                <p className="text-sm">Food and Beverages</p>
              </div>
              <div className="flex flex-[25%] items-center justify-end">
                <p className="font-serif text-red-600">81,500</p>
              </div>
            </div>
            <div className="flex items-stretch">
              <div className="flex flex-[75%] flex-col">
                <p className="text-base font-bold">Mille Billiard</p>
                <p className="text-sm">Sports</p>
              </div>
              <div className="flex flex-[25%] items-center justify-end">
                <p className="font-serif text-red-600">81,500</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-tanakayu-accent cursor-pointer rounded border bg-white p-3 shadow-lg">
          {/* header */}
          <div className="flex w-full items-stretch border-b-2 pb-2">
            <div className="flex flex-[12.5%] items-center justify-start">
              <h4 className="text-4xl font-bold">05</h4>
            </div>
            <div className="flex flex-[62.5%] flex-col">
              <p className="text-sm text-stone-600">Sunday</p>
              <p className="text-sm text-stone-600">July 2025</p>
            </div>
            <div className="flex flex-[25%] items-center justify-end">
              <p className="font-serif text-red-600">81,500</p>
            </div>
          </div>
          {/* items */}
          <div className="flex flex-col items-stretch justify-center gap-2 pt-2">
            <div className="flex items-stretch">
              <div className="flex flex-[75%] flex-col">
                <p className="text-base font-bold">Ayam Goreng Mba Ni</p>
                <p className="text-sm">Food and Beverages</p>
              </div>
              <div className="flex flex-[25%] items-center justify-end">
                <p className="font-serif text-red-600">81,500</p>
              </div>
            </div>
            <div className="flex items-stretch">
              <div className="flex flex-[75%] flex-col">
                <p className="text-base font-bold">Mille Billiard</p>
                <p className="text-sm">Sports</p>
              </div>
              <div className="flex flex-[25%] items-center justify-end">
                <p className="font-serif text-red-600">81,500</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageContent>
  );
};

export default FinancialReport;
