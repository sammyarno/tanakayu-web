'use client';

import { useMemo, useState } from 'react';

import AnnouncementCard from '@/components/AnnouncementCard';
import Breadcrumb from '@/components/Breadcrumb';
import CategoryFilter from '@/components/CategoryFilter';
import PageContent from '@/components/PageContent';
import { announcements, categories } from '@/data/announcements';
import type { Announcement } from '@/types';

const Announcement = () => {
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredAnnouncements = useMemo(
    () =>
      selectedCategory !== '' ? announcements.filter(a => a.categories.includes(selectedCategory)) : announcements,
    [selectedCategory, announcements]
  );

  return (
    <PageContent>
      <Breadcrumb
        items={[
          { label: 'Home', link: '/' },
          { label: 'Announcement', link: '/announcement' },
        ]}
      />
      <section id="menu" className="flex flex-col gap-4">
        <h2 className="font-sans text-3xl font-bold uppercase">📢 Pengumuman</h2>
        <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
      </section>
      <section className="flex flex-col gap-4">
        {filteredAnnouncements.map(a => (
          <AnnouncementCard key={a.id} announcement={a} categories={categories} />
        ))}
      </section>
    </PageContent>
  );
};

export default Announcement;
