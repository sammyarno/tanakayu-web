'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import Breadcrumb from '@/components/Breadcrumb';
import CategoryFilter from '@/components/CategoryFilter';
import LoadingIndicator from '@/components/LoadingIndicator';
import NewsEventCard from '@/components/NewsEventCard';
import PageContent from '@/components/PageContent';
import Pagination from '@/components/Pagination';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateNewsEvent } from '@/hooks/useCreateNewsEvent';
import { useNewsEvents } from '@/hooks/useFetchNewsEvents';
import { PostCommentRequest, usePostComment } from '@/hooks/usePostComment';
import { useStoredUserId } from '@/store/userAuthStore';
import { Category, NewsEventWithComment } from '@/types';
import { AlertCircleIcon, X } from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 5;

const CreateDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [selectedType, setSelectedType] = useState<string>('');
  const { mutateAsync, isPending } = useCreateNewsEvent();
  const userId = useStoredUserId();

  const handleCreateSubmission = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(undefined);
    const formData = new FormData(e.currentTarget);

    const title = formData.get('title')?.toString();
    const content = formData.get('content')?.toString();
    const startDate = formData.get('startDate')?.toString() || null;
    const endDate = formData.get('endDate')?.toString() || null;

    if (!title || !content || !selectedType) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    try {
      await mutateAsync({
        title,
        content,
        type: selectedType,
        startDate: startDate || null,
        endDate: endDate || null,
        actor: userId || '',
      });

      setIsOpen(false);
      setErrorMessage(undefined);
      setSelectedType('');
      toast('News/Event created successfully!', {
        duration: 3000,
        position: 'top-center',
      });
    } catch (error) {
      setErrorMessage('Failed to create news/event');
      console.error(error);
    }
  };

  const handleFormError = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('Invalid form submission');
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedType('');
      setErrorMessage(undefined);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} size="lg" className="tracking-wide">
          Tambah Berita/Acara
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create News/Event</DialogTitle>
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
                placeholder="Enter news/event title"
                disabled={isPending}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="type">Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="news">Berita</SelectItem>
                  <SelectItem value="event">Acara</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-3">
                <Label htmlFor="startDate">Start Date (Optional)</Label>
                <Input id="startDate" name="startDate" type="date" disabled={isPending} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input id="endDate" name="endDate" type="date" disabled={isPending} />
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Enter news/event content"
                disabled={isPending}
                rows={6}
              />
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
  );
};

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
    <PageContent isAdmin>
      <Breadcrumb
        items={[
          { label: 'Home', link: '/admin/dashboard' },
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
