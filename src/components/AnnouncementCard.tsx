import { categoryDisplayMap } from '@/data/announcements';
import type { Announcement } from '@/types';
import { formatDate } from '@/utils/date';
import { AlertDialogAction, AlertDialogCancel } from '@radix-ui/react-alert-dialog';
import { Edit2Icon, Trash } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Props {
  announcement: Announcement;
  editable?: boolean;
}

const DeleteConfirmatonAlert = ({ announcement }: { announcement: Announcement }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Confirmation</AlertDialogTitle>
          <AlertDialogDescription>{announcement.title}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Button className="w-full" variant="outline">
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction>
            <Button variant="destructive" className="w-full">
              <Trash /> Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const EditDialog = ({ announcement }: { announcement: Announcement }) => {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button>
            <Edit2Icon /> Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" autoFocus={false} defaultValue={announcement.title} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="content">Content</Label>
              <Input id="content" name="content" defaultValue={announcement.content} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>
              <Edit2Icon /> Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

const AnnouncementCard = ({ announcement, editable = false }: Props) => {
  return (
    <div className="border-tanakayu-accent flex flex-col items-start gap-2 rounded border bg-white p-3">
      <div className="flex flex-wrap gap-2">
        {announcement.categories.map(cat => {
          const catDisplay = categoryDisplayMap[cat.code];

          return (
            <span
              key={`${announcement.id}-${cat.id}`}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs tracking-wide ${catDisplay?.bgColor} ${catDisplay?.textColor}`}
            >
              {catDisplay?.icon}
              {cat.label}
            </span>
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
