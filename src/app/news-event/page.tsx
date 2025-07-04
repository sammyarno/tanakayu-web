'use client';

import { useCallback, useMemo, useState } from 'react';

import Breadcrumb from '@/components/Breadcrumb';
import CategoryFilter from '@/components/CategoryFilter';
import LoadingIndicator from '@/components/LoadingIndicator';
import NewsEventCard from '@/components/NewsEventCard';
import PageContent from '@/components/PageContent';
import Pagination from '@/components/Pagination';
import { useNewsEvents } from '@/hooks/useFetchNewsEvents';

const ITEMS_PER_PAGE = 5;

const NewsEvent = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { data, isFetching: isLoading } = useNewsEvents();

  // Filter categories
  const filterCategories = [
    { label: 'Semua', value: '' },
    { label: 'Berita', value: 'news' },
    { label: 'Acara', value: 'event' },
  ];

  // Filtered and paginated data
  const filteredItems = useMemo(() => {
    console.log('memo', selectedType, data);
    if (!data) return [];

    return selectedType === '' ? data : data.filter(item => item.type === selectedType);
  }, [selectedType, data]);

  console.log('data', data);

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

  // Handle comment addition
  const handleAddComment = (eventId: string, name: string, comment: string) => {
    if (!name || !comment) {
      return;
    }

    console.log('addComment', eventId, name, comment);
  };

  return (
    <PageContent>
      <Breadcrumb
        items={[
          { label: 'Home', link: '/' },
          { label: 'Berita & Acara', link: '/news-event' },
        ]}
      />
      <section id="menu" className="flex flex-col gap-4">
        <h2 className="font-sans text-3xl font-bold uppercase">📰 Berita & Acara</h2>
        <CategoryFilter categories={filterCategories} selectedCategory={selectedType} onSelect={handleFilterChange} />
      </section>
      <section className="flex flex-col gap-4">
        <LoadingIndicator isLoading={isLoading} />

        {paginatedItems.map(item => (
          <NewsEventCard
            key={`event-card-${item.id}`}
            item={item}
            onAddComment={handleAddComment}
            isLoading={isLoading}
          />
        ))}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </section>
    </PageContent>
  );
};

export default NewsEvent;
