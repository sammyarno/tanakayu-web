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
import { useDeletePost } from '@/hooks/useDeletePost';
import type { PostWithVotes } from '@/types/post';
import { AlertCircleIcon, Trash } from 'lucide-react';
import { toast } from 'sonner';

const DeleteConfirmationAlert = ({ post }: { post: PostWithVotes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: deletePost, isPending: isLoading } = useDeletePost();

  const handleDelete = async () => {
    try {
      await deletePost({ id: post.id });
      setIsOpen(false);
      toast.success('Post deleted successfully', {
        duration: 3000,
        position: 'top-center',
      });
    } catch {
      toast.error('Failed to delete post', {
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
            Confirm Delete
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the {post.type === 'event' ? 'event' : 'announcement'} &quot;{post.title}&quot;?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationAlert;
