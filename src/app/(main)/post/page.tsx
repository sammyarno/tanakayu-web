'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

import Breadcrumb from '@/components/Breadcrumb';
import CategoryFilter from '@/components/CategoryFilter';
import PageContent from '@/components/PageContent';
import PageHeader from '@/components/PageHeader';
import PageSkeleton from '@/components/PageSkeleton';
import Pagination from '@/components/Pagination';
import PostCard, { PostCardSkeleton } from '@/components/post/Card';
import { ROLES } from '@/constants/roles';
import { useAuth } from '@/hooks/auth/useAuth';
import { usePosts } from '@/hooks/useFetchPosts';
import type { Category } from '@/types';
import { Megaphone } from 'lucide-react';

const CreateDialog = dynamic(() => import('@/components/post/CreateDialog'));

const ITEMS_PER_PAGE = 5;

const PostContent = () => {
  const searchParams = useSearchParams();
  const filterParams = searchParams.get('filter');
  const { role } = useAuth();
  const isAdmin = role === ROLES.SUPERADMIN;

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

  const breadcrumbItems = [
    { label: 'Home', link: '/' },
    { label: 'Announcements & Events', link: '/post' },
  ];

  return (
    <PageContent>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        icon={Megaphone}
        title="Announcements & Events"
        description={data ? `${data.length} post${data.length !== 1 ? 's' : ''}` : 'Loading...'}
      />

      {isAdmin && <CreateDialog />}

      <CategoryFilter categories={filterCategories} selectedCategory={selectedType} onSelect={handleFilterChange} />

      <section className="flex flex-col gap-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
          : paginatedItems.map(item => <PostCard key={`post-card-${item.id}`} post={item} editable={isAdmin} />)}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </section>
    </PageContent>
  );
};

const PostPage = () => {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PostContent />
    </Suspense>
  );
};

export default PostPage;
