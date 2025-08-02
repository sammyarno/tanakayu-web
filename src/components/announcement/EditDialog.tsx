import { FormEvent, useEffect, useState } from 'react';

import CategorySelector from '@/components/CategorySelector';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/auth/useAuth';
import { useEditAnnouncement } from '@/hooks/useEditAnnouncement';
import { useAnnouncementCategories } from '@/hooks/useFetchAnnouncementCategories';
import { Announcement } from '@/types';
import { AlertCircleIcon, Edit2Icon } from 'lucide-react';

const EditDialog = ({ announcement }: { announcement: Announcement }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [tempCategories, setTempCategories] = useState<string[]>(announcement.categories.map(x => x.code));
  const { mutateAsync, isPending } = useEditAnnouncement();
  const { data: categories } = useAnnouncementCategories();
  const { displayName } = useAuth();

  const handleEditSubmission = async (e: FormEvent<HTMLFormElement>) => {
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
        id: announcement.id,
        title,
        content,
        categories: categoryIds,
        actor: displayName || '',
      });

      setIsOpen(false);
      setErrorMessage(undefined);
    } catch (error) {
      setErrorMessage('Failed to update announcement');
      console.error(error);
    }
  };

  const handleFormError = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('Invalid form submission');
  };

  useEffect(() => {
    if (!isOpen) return;
    setTempCategories(announcement.categories.map(x => x.code));
  }, [isOpen, announcement]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="!px-1 text-blue-500" onClick={() => setIsOpen(true)}>
            <Edit2Icon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmission} onError={handleFormError}>
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
                  autoFocus={false}
                  defaultValue={announcement.title}
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
                <Textarea id="content" name="content" defaultValue={announcement.content} disabled={isPending} />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" disabled={isPending} onClick={() => setIsOpen(false)} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                <Edit2Icon /> Edit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditDialog;
