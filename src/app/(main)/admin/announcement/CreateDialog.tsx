'use client';

import { FormEvent, useEffect, useState } from 'react';

import CategorySelector from '@/components/CategorySelector';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCreateAnnouncement } from '@/hooks/useCreateAnnouncement';
import { useAnnouncementCategories } from '@/hooks/useFetchAnnouncementCategories';
import { AlertCircleIcon } from 'lucide-react';

const CreateDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [tempCategories, setTempCategories] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { mutateAsync, isPending } = useCreateAnnouncement();
  const { data: categories } = useAnnouncementCategories();
  const { username } = useAuth();

  const handleCreateSubmission = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(undefined);

    // Validate required fields
    if (!title.trim() || !content.trim() || !tempCategories.length) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    // Strip HTML tags for basic content validation
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    if (!textContent) {
      setErrorMessage('Please enter some content');
      return;
    }

    const categoryIds = tempCategories.map(x => categories?.find(c => c.code === x)?.id || '');

    try {
      await mutateAsync({
        title: title.trim(),
        content,
        categoryIds: categoryIds,
        actor: username || '',
      });

      // Reset form
      setIsOpen(false);
      setErrorMessage(undefined);
      setTempCategories([]);
      setTitle('');
      setContent('');
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
      setTitle('');
      setContent('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} size="lg" className="tracking-wide">
          Tambah Pengumuman
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
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
                value={title}
                onChange={e => setTitle(e.target.value)}
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
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your announcement content here. You can format text, add images, and create lists."
                disabled={isPending}
                className="min-h-[300px]"
                storageFolder="announcements"
                fileNamePrefix="announcement"
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

export default CreateDialog;
