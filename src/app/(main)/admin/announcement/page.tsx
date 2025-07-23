'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

import AnnouncementCard from '@/components/AnnouncementCard';
import Breadcrumb from '@/components/Breadcrumb';
import CategoryFilter from '@/components/CategoryFilter';
import CategorySelector from '@/components/CategorySelector';
import LoadingIndicator from '@/components/LoadingIndicator';
import PageContent from '@/components/PageContent';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateAnnouncement } from '@/hooks/useCreateAnnouncement';
import { useAnnouncementCategories } from '@/hooks/useFetchAnnouncementCategories';
import { useAnnouncements } from '@/hooks/useFetchAnnouncements';
import { useUserId } from '@/store/userAuthStore';
import type { Announcement } from '@/types';
import { AlertCircleIcon, PlusIcon } from 'lucide-react';

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
    <PageContent>
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

const CreateDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [tempCategories, setTempCategories] = useState<string[]>([]);
  const { mutateAsync, isPending } = useCreateAnnouncement();
  const { data: categories } = useAnnouncementCategories();
  const userId = useUserId();

  const handleCreateSubmission = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(undefined);
    const formData = new FormData(e.currentTarget);

    const title = formData.get('title')?.toString();
    const content = formData.get('content')?.toString();
    const categoryCodes = tempCategories;

    if (!title || !content || !categoryCodes.length) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    const categoryIds = categoryCodes.map(x => categories?.find(c => c.code === x)?.id || '');

    try {
      await mutateAsync({
        title,
        content,
        categories: categoryIds,
        actor: userId || 'system',
      });

      setIsOpen(false);
      setErrorMessage(undefined);
      setTempCategories([]);
    } catch (error) {
      setErrorMessage('Failed to create announcement');
      console.error(error);
    }
  };

  const handleFormError = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('Invalid form submission');
  };

  useEffect(() => {
    if (!isOpen) {
      setTempCategories([]);
    }
  }, [isOpen]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsOpen(true)} size="lg" className="tracking-wide">
            Tambah Pengumuman
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSubmission} onError={handleFormError}>
            <div className="grid gap-4">
              {errorMessage && (
                <Alert variant="destructive" className="border-red-600 bg-red-300/40">
                  <AlertCircleIcon />
                  <AlertTitle className="tracking-wider capitalize">{errorMessage}</AlertTitle>
                </Alert>
              )}
              <div className="grid gap-3">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  autoFocus={true}
                  placeholder="Enter announcement title"
                  disabled={isPending}
                />
              </div>
              <CategorySelector
                name="categories"
                defaultValue={tempCategories}
                onValueChange={setTempCategories}
                disabled={isPending}
              />
              <div className="grid gap-3">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" name="content" placeholder="Enter announcement content" disabled={isPending} />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" disabled={isPending} onClick={() => setIsOpen(false)} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Announcement;
