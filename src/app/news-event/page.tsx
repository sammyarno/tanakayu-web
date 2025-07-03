'use client';

import { useMemo, useState, useCallback } from 'react';

import Breadcrumb from '@/components/Breadcrumb';
import CategoryFilter from '@/components/CategoryFilter';
import LoadingIndicator from '@/components/LoadingIndicator';
import NewsEventCard from '@/components/NewsEventCard';
import PageContent from '@/components/PageContent';
import Pagination from '@/components/Pagination';
import { newsEvents } from '@/data/newsevent';
import type { NewsEventComment } from '@/types';

const ITEMS_PER_PAGE = 5;

const NewsEvent = () => {
  // UI states
  const [selectedType, setSelectedType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Comments state
  const [commentsData, setCommentsData] = useState<Record<number, NewsEventComment[]>>(() => {
    const initial: Record<number, NewsEventComment[]> = {};
    newsEvents.forEach(item => {
      initial[item.id] = [...item.comments];
    });
    return initial;
  });

  // Filter categories
  const filterCategories = [
    { label: 'Semua', value: 'all' },
    { label: 'Berita', value: 'news' },
    { label: 'Acara', value: 'event' },
  ];
  
  // Filtered and paginated data
  const filteredItems = useMemo(() => {
    return selectedType === 'all' 
      ? newsEvents 
      : newsEvents.filter(item => item.type === selectedType);
  }, [selectedType]);
  
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);
  
  const totalPages = useMemo(() => {
    return Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  }, [filteredItems]);
  
  // Handle filter change
  const handleFilterChange = useCallback(async (value: string) => {
    setIsLoading(true);
    setSelectedType(value);
    setCurrentPage(1); // Reset to first page when filter changes
    
    // Simulate API call with a small delay
    await new Promise(resolve => setTimeout(resolve, 200));
    setIsLoading(false);
  }, []);
  
  // Handle pagination
  const handlePageChange = useCallback(async (page: number) => {
    setIsLoading(true);
    setCurrentPage(page);
    
    // Simulate API call with a small delay
    await new Promise(resolve => setTimeout(resolve, 200));
    setIsLoading(false);
  }, []);
  
  // Handle comment addition
  const handleAddComment = useCallback(async (eventId: number, name: string, comment: string) => {
    if (!name || !comment) {
      return;
    }

    const newCommentId =
      commentsData[eventId]?.length > 0 ? Math.max(...commentsData[eventId].map(c => c.id ?? 0)) + 1 : 1;

    const newComment: NewsEventComment = {
      id: newCommentId,
      comment: comment,
      createdAt: new Date(),
      createdBy: name,
    };

    setIsLoading(true);
    
    // Simulate API call with a small delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setCommentsData(prev => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), newComment],
    }));
    
    setIsLoading(false);
  }, [commentsData]);

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
        <CategoryFilter 
          categories={filterCategories}
          selectedCategory={selectedType}
          onSelect={handleFilterChange}
        />
      </section>
      <section className="flex flex-col gap-4">
        <LoadingIndicator isLoading={isLoading} />
        
        {paginatedItems.map(item => (
          <NewsEventCard 
            key={`item-${item.id}`}
            item={item}
            comments={commentsData[item.id] || []}
            onAddComment={handleAddComment}
            isLoading={isLoading}
          />
        ))}
        
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </section>
    </PageContent>
  );
};

export default NewsEvent;
