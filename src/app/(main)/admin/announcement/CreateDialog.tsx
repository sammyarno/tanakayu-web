'use client';

import { FormEvent, useEffect, useState } from 'react';

import CategorySelector from '@/components/CategorySelector';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateAnnouncement } from '@/hooks/useCreateAnnouncement';
import { useAnnouncementCategories } from '@/hooks/useFetchAnnouncementCategories';
import { useStoredUserDisplayName } from '@/store/userAuthStore';
import { AlertCircleIcon } from 'lucide-react';

const CreateDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [tempCategories, setTempCategories] = useState<string[]>([]);
  const { mutateAsync, isPending } = useCreateAnnouncement();
  const { data: categories } = useAnnouncementCategories();
  const displayName = useStoredUserDisplayName();

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
        categoryIds: categoryIds,
        actor: displayName || '',
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
      setErrorMessage(undefined);
    }
  }, [isOpen]);

  return (
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
  );
};

export default CreateDialog;
