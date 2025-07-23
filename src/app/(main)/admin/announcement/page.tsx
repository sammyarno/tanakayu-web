'use client';

import { useMemo, useState } from 'react';

import AnnouncementCard from '@/components/AnnouncementCard';
import Breadcrumb from '@/components/Breadcrumb';
import CategoryFilter from '@/components/CategoryFilter';
import LoadingIndicator from '@/components/LoadingIndicator';
import PageContent from '@/components/PageContent';
import { useAnnouncementCategories } from '@/hooks/useFetchAnnouncementCategories';
import { useAnnouncements } from '@/hooks/useFetchAnnouncements';
import type { Announcement } from '@/types';

import CreateDialog from './CreateDialog';

const Announcement = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const { data: announcements, isFetching: isLoadingAnnouncements } = useAnnouncements();
  const { data: categories, isFetching: isLoadingCategories } = useAnnouncementCategories();

  const isLoading = isLoadingAnnouncements || isLoadingCategories;

  const filteredAnnouncements = useMemo(() => {
    if (!announcements) return [];

    return selectedCategory !== ''
      ? announcements.filter(a => a.categories.map(x => x.code).includes(selectedCategory))
      : announcements;
  }, [selectedCategory, announcements]);

  const categoryOptions = useMemo(() => {
    if (!categories) return [];
    return [{ label: 'Semua', code: '', id: 'semua' }, ...categories];
  }, [categories]);

  return (
    <PageContent isAdmin>
      <Breadcrumb
        items={[
          { label: 'Home', link: '/admin/dashboard' },
          { label: 'Pengumuman', link: '/admin/announcement' },
        ]}
      />
      <section id="menu" className="flex flex-col gap-4">
        <h2 className="font-sans text-3xl font-bold uppercase">📢 Pengumuman</h2>
        <CreateDialog />
        <CategoryFilter
          categories={categoryOptions ?? []}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </section>
      <section className="flex flex-col gap-4">
        <LoadingIndicator isLoading={isLoading} />
        {filteredAnnouncements.map(announcement => (
          <AnnouncementCard key={announcement.id} announcement={announcement} editable />
        ))}
      </section>
    </PageContent>
  );
};

export default Announcement;
