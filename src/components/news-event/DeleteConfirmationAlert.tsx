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
import { useAuth } from '@/hooks/auth/useAuth';
import { useDeleteNewsEvent } from '@/hooks/useDeleteNewsEvent';
import { NewsEventWithComment } from '@/types';
import { AlertCircleIcon, Trash } from 'lucide-react';
import { toast } from 'sonner';

const DeleteConfirmationAlert = ({ item }: { item: NewsEventWithComment }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: deleteNewsEvent, isPending: isLoading } = useDeleteNewsEvent();
  const { username } = useAuth();

  const handleDelete = async () => {
    if (!username) return;
    try {
      await deleteNewsEvent({
        id: item.id,
        actor: username,
      });
      setIsOpen(false);
      toast.success('News event deleted successfully', {
        duration: 3000,
        position: 'top-center',
      });
    } catch {
      toast.error('Failed to delete news event', {
        duration: 3000,
        position: 'top-center',
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="!px-1 text-red-500" disabled={isLoading}>
          <Trash className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircleIcon className="h-5 w-5 text-red-500" />
            Konfirmasi Hapus
          </AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus {item.type === 'news' ? 'berita' : 'acara'} &quot;{item.title}&quot;?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? 'Menghapus...' : 'Hapus'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationAlert;
