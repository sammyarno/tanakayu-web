import { type FormEvent, useEffect, useState } from 'react';

import { categoryDisplayMap } from '@/data/announcements';
import { useDeleteAnnouncement } from '@/hooks/useDeleteAnnouncement';
import { useEditAnnouncement } from '@/hooks/useEditAnnouncement';
import { useAnnouncementCategories } from '@/hooks/useFetchAnnouncementCategories';
import { useUserId } from '@/store/userAuthStore';
import type { Announcement } from '@/types';
import { formatDate } from '@/utils/date';
import { AlertCircleIcon, Edit2Icon, Trash } from 'lucide-react';

import CategorySelector from './CategorySelector';
import { Alert, AlertTitle } from './ui/alert';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface Props {
  announcement: Announcement;
  editable?: boolean;
}

const DeleteConfirmatonAlert = ({ announcement }: { announcement: Announcement }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync, isPending: isLoading } = useDeleteAnnouncement();
  const userId = useUserId();

  const handleDelete = async () => {
    await mutateAsync({
      id: announcement.id,
      actor: userId || 'system',
    });

    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive" onClick={() => setIsOpen(true)}>
          <Trash /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Confirmation</AlertDialogTitle>
          <AlertDialogDescription>{announcement.title}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" disabled={isLoading} onClick={() => setIsOpen(false)} type="button">
            Cancel
          </Button>
          <Button variant="destructive" className="w-full" onClick={handleDelete} disabled={isLoading}>
            <Trash /> Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const EditDialog = ({ announcement }: { announcement: Announcement }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [tempCategories, setTempCategories] = useState<string[]>(announcement.categories.map(x => x.code));
  const { mutateAsync, isPending } = useEditAnnouncement();
  const { data: categories } = useAnnouncementCategories();
  const userId = useUserId();

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
        actor: userId || 'system',
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
          <Button size="sm" onClick={() => setIsOpen(true)}>
            <Edit2Icon /> Edit
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

const AnnouncementCard = ({ announcement, editable = false }: Props) => {
  return (
    <div className="border-tanakayu-accent flex flex-col items-start gap-2 rounded border bg-white p-3">
      <div className="flex flex-wrap gap-2">
        {announcement.categories.map(cat => {
          const catDisplay = categoryDisplayMap[cat.code];

          return (
            <Badge
              key={`${announcement.id}-${cat.id}`}
              variant="default"
              className={`${catDisplay?.bgColor} ${catDisplay?.textColor}`}
            >
              {catDisplay?.icon}
              {cat.label}
            </Badge>
          );
        })}
      </div>
      <div className="flex items-center">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">{announcement.title}</h2>
          <p className="text-xs text-gray-700">
            {announcement.createdBy} | {formatDate(announcement.createdAt)}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-700">{announcement.content}</p>
      {editable && (
        <div className="flex w-full justify-end gap-2">
          <DeleteConfirmatonAlert announcement={announcement} />
          <EditDialog announcement={announcement} />
        </div>
      )}
    </div>
  );
};

export default AnnouncementCard;
