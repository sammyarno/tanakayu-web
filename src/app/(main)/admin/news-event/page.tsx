'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import Breadcrumb from '@/components/Breadcrumb';
import CategoryFilter from '@/components/CategoryFilter';
import LoadingIndicator from '@/components/LoadingIndicator';
import PageContent from '@/components/PageContent';
import Pagination from '@/components/Pagination';
import NewsEventCard from '@/components/news-event/Card';
import { useNewsEvents } from '@/hooks/useFetchNewsEvents';
import type { Category } from '@/types';

import CreateDialog from './CreateDialog';

const ITEMS_PER_PAGE = 5;

const NewsEventContent = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { data, isFetching: isFetchLoading } = useNewsEvents();

  const searchParams = useSearchParams();
  const filterParams = searchParams.get('filter');

  const isLoading = isFetchLoading;

  const filterCategories: Category[] = useMemo(
    () => [
      { label: 'Semua', code: '', id: 'semua' },
      { label: 'Berita', code: 'news', id: 'berita' },
      { label: 'Acara', code: 'event', id: 'acara' },
    ],
    []
  );

  // Filtered and paginated data
  const filteredItems = useMemo(() => {
    if (!data) return [];

    return selectedType === '' ? data : data.filter(item => item.type === selectedType);
  }, [selectedType, data]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  }, [filteredItems]);

  // Handle filter change
  const handleFilterChange = useCallback(async (value: string) => {
    setSelectedType(value);
    setCurrentPage(1);
  }, []);

  // Handle pagination
  const handlePageChange = useCallback(async (page: number) => {
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    if (filterParams) {
      handleFilterChange(filterParams);
    }
  }, [filterParams, handleFilterChange]);

  return (
    <PageContent allowedRoles={['ADMIN']}>
      <Breadcrumb
        items={[
          { label: 'Home', link: '/admin' },
          { label: 'Berita & Acara', link: '/admin/news-event' },
        ]}
      />
      <section id="menu" className="flex flex-col gap-4">
        <h2 className="font-sans text-3xl font-bold uppercase">📰 Berita & Acara</h2>
        <CreateDialog />
        <CategoryFilter categories={filterCategories} selectedCategory={selectedType} onSelect={handleFilterChange} />
      </section>
      <section className="flex flex-col gap-4">
        <LoadingIndicator isLoading={isLoading} />

        {paginatedItems.map(item => (
          <NewsEventCard key={`event-card-${item.id}`} item={item} editable />
        ))}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </section>
    </PageContent>
  );
};

const NewsEvent = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewsEventContent />
    </Suspense>
  );
};

export default NewsEvent;
