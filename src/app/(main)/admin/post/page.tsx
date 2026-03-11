'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import Breadcrumb from '@/components/Breadcrumb';
import CategoryFilter from '@/components/CategoryFilter';
import LoadingIndicator from '@/components/LoadingIndicator';
import PageContent from '@/components/PageContent';
import { SUPERADMIN_ONLY } from '@/constants/roles';
import Pagination from '@/components/Pagination';
import PostCard from '@/components/post/Card';
import { usePosts } from '@/hooks/useFetchPosts';
import type { Category } from '@/types';

import dynamic from 'next/dynamic';

const CreateDialog = dynamic(() => import('./CreateDialog'));

const ITEMS_PER_PAGE = 5;

const PostAdminContent = () => {
  const searchParams = useSearchParams();
  const filterParams = searchParams.get('filter');

  const [selectedType, setSelectedType] = useState<string>(filterParams ?? '');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { data, isFetching: isLoading } = usePosts();

  const filterCategories: Category[] = useMemo(
    () => [
      { label: 'All', code: '', id: 'semua' },
      { label: 'Announcement', code: 'announcement', id: 'announcement' },
      { label: 'Event', code: 'event', id: 'event' },
    ],
    []
  );

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

  const handleFilterChange = useCallback((value: string) => {
    setSelectedType(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <PageContent allowedRoles={SUPERADMIN_ONLY}>
      <Breadcrumb
        items={[
          { label: 'Home', link: '/admin' },
          { label: 'Announcements & Events', link: '/admin/post' },
        ]}
      />
      <section id="menu" className="flex flex-col gap-4">
        <h2 className="font-sans text-3xl font-bold uppercase">Announcements & Events</h2>
        <CreateDialog />
        <CategoryFilter categories={filterCategories} selectedCategory={selectedType} onSelect={handleFilterChange} />
      </section>
      <section className="flex flex-col gap-4">
        <LoadingIndicator isLoading={isLoading} />

        {paginatedItems.map(item => (
          <PostCard key={`post-card-${item.id}`} post={item} editable />
        ))}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </section>
    </PageContent>
  );
};

const PostAdmin = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostAdminContent />
    </Suspense>
  );
};

export default PostAdmin;
