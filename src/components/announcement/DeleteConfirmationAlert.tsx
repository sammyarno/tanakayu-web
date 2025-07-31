import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useDeleteAnnouncement } from '@/hooks/useDeleteAnnouncement';
import { useStoredUserDisplayName } from '@/store/userAuthStore';
import { Announcement } from '@/types';
import { Trash } from 'lucide-react';

const DeleteConfirmatonAlert = ({ announcement }: { announcement: Announcement }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync, isPending: isLoading } = useDeleteAnnouncement();
  const displayName = useStoredUserDisplayName();

  const handleDelete = async () => {
    await mutateAsync({
      id: announcement.id,
      actor: displayName || '',
    });

    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="!px-1 text-red-500" onClick={() => setIsOpen(true)}>
          <Trash className="h-4 w-4" />
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

export default DeleteConfirmatonAlert;
