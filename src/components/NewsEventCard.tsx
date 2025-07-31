import { type FormEvent, memo, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Alert, AlertTitle } from '@/components/ui/alert';
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

const editNewsEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['news', 'event'], { message: 'Type is required' }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type EditNewsEventFormData = z.infer<typeof editNewsEventSchema>;

const EditDialog = ({ item }: { item: NewsEventWithComment }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: editNewsEvent, isPending } = useEditNewsEvent();
  const displayName = useStoredUserDisplayName();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditNewsEventFormData>({
    resolver: zodResolver(editNewsEventSchema),
    defaultValues: {
      title: item.title,
      content: item.content,
      type: item.type as 'news' | 'event',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
    },
  });

  const onSubmit = async (data: EditNewsEventFormData) => {
    try {
      await editNewsEvent({
        id: item.id,
        title: data.title,
        content: data.content,
        type: data.type,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        actor: displayName || '',
      });

      setIsOpen(false);
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

  useEffect(() => {
    if (!isOpen) {
      reset({
        title: item.title,
        content: item.content,
        type: item.type as 'news' | 'event',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
      });
    }
  }, [isOpen, item, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="!px-1 text-blue-500" disabled={isPending}>
          <Edit2Icon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {item.type === 'news' ? 'Berita' : 'Acara'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            {(errors.title || errors.content || errors.type) && (
              <Alert variant="destructive" className="border-red-600 bg-red-300/40">
                <AlertCircleIcon />
                <AlertTitle className="tracking-wider capitalize">
                  {errors.title?.message || errors.content?.message || errors.type?.message}
                </AlertTitle>
              </Alert>
            )}
            <div className="grid gap-3">
              <Label htmlFor="title">Title</Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="title"
                    autoFocus={true}
                    placeholder="Enter news/event title"
                    disabled={isPending}
                  />
                )}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="type">Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="news">Berita</SelectItem>
                      <SelectItem value="event">Acara</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-3">
                <Label htmlFor="startDate">Start Date (Optional)</Label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id="startDate" type="date" disabled={isPending} />
                  )}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id="endDate" type="date" disabled={isPending} />
                  )}
                />
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="content">Content</Label>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="content"
                    placeholder="Enter news/event content"
                    disabled={isPending}
                    rows={6}
                  />
                )}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" disabled={isPending} onClick={() => setIsOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              <Edit2Icon /> Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const NewsEventCard = memo(function NewsEventCard({ item, editable = false }: NewsEventCardProps) {
  const { mutateAsync: postComment, isPending: isPostLoading } = usePostComment();
  const { mutateAsync: moderateComment, isPending: isModerateLoading } = useModerateComment();

  const displayName = useStoredUserDisplayName();
  const comments = item.comments;
  const isLoading = isPostLoading || isModerateLoading;

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
            <EditDialog item={item} />
            <DeleteConfirmationAlert item={item} />
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
