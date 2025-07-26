import { type FormEvent, memo, useEffect, useState } from 'react';

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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEditNewsEvent } from '@/hooks/useEditNewsEvent';
import { useModerateComment } from '@/hooks/useModerateComment';
import { usePostComment } from '@/hooks/usePostComment';
import { useStoredUserDisplayName } from '@/store/userAuthStore';
import type { NewsEventWithComment } from '@/types';
import { formatDate } from '@/utils/date';
import { AlertCircleIcon, Calendar, Check, Edit2Icon, Trash, X } from 'lucide-react';
import { toast } from 'sonner';

interface NewsEventCardProps {
  item: NewsEventWithComment;
  editable?: boolean;
}

const NewsEventCard = memo(function NewsEventCard({ item, editable = false }: NewsEventCardProps) {
  const { mutateAsync: postComment, isPending: isPostLoading } = usePostComment();
  const { mutateAsync: moderateComment, isPending: isModerateLoading } = useModerateComment();
  const { mutateAsync: editNewsEvent, isPending: isEditLoading } = useEditNewsEvent();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editContent, setEditContent] = useState(item.content);
  const [editType, setEditType] = useState<'news' | 'event'>(item.type as 'news' | 'event');

  const displayName = useStoredUserDisplayName();

  // Reset form values when dialog opens
  useEffect(() => {
    if (isEditDialogOpen) {
      setEditTitle(item.title);
      setEditContent(item.content);
      setEditType(item.type as 'news' | 'event');
    }
  }, [isEditDialogOpen, item.title, item.content, item.type]);
  const comments = item.comments;
  const isLoading = isPostLoading || isModerateLoading || isEditLoading;

  const handleApproveComment = async (commentId: string) => {
    if (!displayName) return;
    try {
      await moderateComment({
        commentId,
        action: 'approve',
        actor: displayName,
      });
      toast.success('Comment approved successfully', {
        duration: 3000,
        position: 'top-center',
      });
    } catch {
      toast.error('Failed to approve comment', {
        duration: 3000,
        position: 'top-center',
      });
    }
  };

  const handleRejectComment = async (commentId: string) => {
    if (!displayName) return;
    try {
      await moderateComment({
        commentId,
        action: 'reject',
        actor: displayName,
      });
      toast.success('Comment rejected successfully', {
        duration: 3000,
        position: 'top-center',
      });
    } catch {
      toast.error('Failed to reject comment', {
        duration: 3000,
        position: 'top-center',
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!displayName) return;
    try {
      await moderateComment({
        commentId,
        action: 'delete',
        actor: displayName,
      });
      toast.success('Comment deleted successfully', {
        duration: 3000,
        position: 'top-center',
      });
    } catch {
      toast.error('Failed to delete comment', {
        duration: 3000,
        position: 'top-center',
      });
    }
  };

  const handlePostComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const nameInput = form.elements.namedItem('name') as HTMLInputElement;
    const commentInput = form.elements.namedItem('comment') as HTMLTextAreaElement;
    const name = nameInput.value.trim();
    const comment = commentInput.value.trim();

    if (name && comment) {
      await postComment({
        actor: name,
        comment,
        targetID: item.id,
        targetType: 'news_event',
      });
      form.reset();
      toast('Your comment has been submitted and is pending admin approval.', {
        duration: 5000,
        position: 'top-center',
        action: {
          label: <X />,
          onClick: () => toast.dismiss(),
        },
      });
    }
  };

  const handleEditNewsEvent = async () => {
    if (!displayName) return;
    try {
      await editNewsEvent({
        id: item.id,
        title: editTitle,
        content: editContent,
        type: editType,
        actor: displayName,
      });
      setIsEditDialogOpen(false);
      toast.success('News event updated successfully', {
        duration: 3000,
        position: 'top-center',
      });
    } catch {
      toast.error('Failed to update news event', {
        duration: 3000,
        position: 'top-center',
      });
    }
  };

  const handleDeleteNewsEvent = async () => {
    if (!displayName) return;
    try {
      await editNewsEvent({
        id: item.id,
        actor: displayName,
      });
      setIsDeleteDialogOpen(false);
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

  const DeleteConfirmationAlert = () => (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDeleteNewsEvent} disabled={isLoading}>
            {isLoading ? 'Menghapus...' : 'Hapus'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const EditDialog = () => (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="!px-1 text-blue-500" disabled={isLoading}>
          <Edit2Icon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {item.type === 'news' ? 'Berita' : 'Acara'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-type">Tipe</Label>
            <Select value={editType} onValueChange={(value: 'news' | 'event') => setEditType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="news">Berita</SelectItem>
                <SelectItem value="event">Acara</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-title">Judul</Label>
            <Input
              id="edit-title"
              value={editTitle}
              onChange={e => {
                e.preventDefault();
                setEditTitle(e.target.value);
              }}
              placeholder="Masukkan judul"
            />
          </div>
          <div>
            <Label htmlFor="edit-content">Konten</Label>
            <Textarea
              id="edit-content"
              value={editContent}
              onChange={e => {
                e.preventDefault();
                setEditContent(e.target.value);
              }}
              placeholder="Masukkan konten"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={handleEditNewsEvent} disabled={isLoading || !editTitle.trim() || !editContent.trim()}>
            {isLoading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="bg-qwhite border-tanakayu-accent rounded border p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="flex items-center text-lg font-semibold">
            <Calendar className="text-tanaka-highlight mr-2 h-5 w-5" />[{item.type === 'news' ? 'Berita' : 'Acara'}]{' '}
            {item.title}
          </h2>
          <p className="mb-2 text-xs text-gray-600">
            {item.createdBy} | {formatDate(item.createdAt)}
          </p>
          <p className="text-sm text-gray-700">{item.content}</p>
        </div>
        {editable && (
          <div className="ml-2 flex items-center gap-1">
            <EditDialog />
            <DeleteConfirmationAlert />
          </div>
        )}
      </div>
      <hr className="my-2" />
      <details>
        <summary className="text-tanaka-dark cursor-pointer text-sm font-medium">💬 Lihat & Tambah Komentar</summary>

        <div className="flex flex-col gap-4 py-2">
          {comments.length > 0 ? (
            <div className="flex flex-col gap-1">
              {comments.map((c, index) => (
                <div key={index} className="flex items-center justify-between rounded bg-gray-100 px-2 py-1 text-sm">
                  <p className="text-tanaka-dark">
                    {c.createdBy}: {c.comment}
                  </p>
                  {editable && (
                    <div className="flex items-center gap-1">
                      {!c.approvedAt && !c.rejectedAt && (
                        <>
                          <Button
                            variant="ghost"
                            className="!px-1 text-green-500"
                            onClick={() => handleApproveComment(c.id)}
                            disabled={isLoading}
                          >
                            <Check />
                          </Button>
                          <Button
                            variant="ghost"
                            className="!px-1 text-red-500"
                            onClick={() => handleRejectComment(c.id)}
                            disabled={isLoading}
                          >
                            <X />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        className="!px-1 text-red-500"
                        onClick={() => handleDeleteComment(c.id)}
                        disabled={isLoading}
                      >
                        <Trash />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-800 italic">Belum ada komentar</p>
          )}
          {/* Comment form */}
          {!editable && (
            <div className="border-tanakayu-dark/35 border-t py-2">
              <h3 className="mb-2 text-sm font-semibold text-gray-800">Tulis Komentar</h3>
              <form onSubmit={handlePostComment} className="flex flex-col gap-2">
                <Input
                  type="text"
                  name="name"
                  required
                  placeholder="Nama Anda"
                  className="rounded border p-2 text-sm"
                />
                <Textarea
                  name="comment"
                  required
                  rows={2}
                  placeholder="Tulis komentar..."
                  className="rounded border p-2 text-sm"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`bg-tanakayu-highlight text-tanakayu-bg w-full rounded py-1 font-bold ${isLoading ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  {isLoading ? 'Mengirim...' : 'Kirim'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </details>
    </div>
  );
});

export default NewsEventCard;
