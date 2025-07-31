import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AlertCircleIcon, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useEditNewsEvent } from '@/hooks/useEditNewsEvent';
import { useStoredUserDisplayName } from '@/store/userAuthStore';
import { NewsEventWithComment } from '@/types';

const DeleteConfirmationAlert = ({ item }: { item: NewsEventWithComment }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: editNewsEvent, isPending: isLoading } = useEditNewsEvent();
  const displayName = useStoredUserDisplayName();

  const handleDelete = async () => {
    if (!displayName) return;
    try {
      await editNewsEvent({
        id: item.id,
        actor: displayName,
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