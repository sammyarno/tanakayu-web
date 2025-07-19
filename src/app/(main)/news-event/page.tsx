'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import Breadcrumb from '@/components/Breadcrumb';
import CategoryFilter from '@/components/CategoryFilter';
import LoadingIndicator from '@/components/LoadingIndicator';
import NewsEventCard from '@/components/NewsEventCard';
import PageContent from '@/components/PageContent';
import Pagination from '@/components/Pagination';
import { useNewsEvents } from '@/hooks/useFetchNewsEvents';
import { PostCommentRequest, usePostComment } from '@/hooks/usePostComment';
import { Category, NewsEventWithComment } from '@/types';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 5;

const NewsEvent = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { data, isFetching: isFetchLoading } = useNewsEvents();
  const { mutateAsync: postComment, isPending: isPostLoading } = usePostComment();
  const searchParams = useSearchParams();
  const filterParams = searchParams.get('filter');

  const isLoading = isFetchLoading || isPostLoading;

  // Filter categories
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

  // Handle comment addition
  const handleAddComment = async (item: NewsEventWithComment, name: string, comment: string) => {
    if (!name || !comment) {
      return;
    }

    const payload: PostCommentRequest = {
      actor: name,
      comment,
      targetID: item.id,
      targetType: 'news_event',
    };

    await postComment(payload);

    toast('Your comment has been submitted and is pending admin approval.', {
      duration: 5000,
      position: 'top-center',
      action: {
        label: <X />,
        onClick: () => toast.dismiss(),
      },
    });
  };

  useEffect(() => {
    if (filterParams) {
      handleFilterChange(filterParams);
    }
  }, [filterParams, handleFilterChange]);

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
