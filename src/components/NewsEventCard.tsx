import { type FormEvent, memo } from 'react';

import DeleteConfirmationAlert from '@/components/news-event/DeleteConfirmationAlert';
import EditDialog from '@/components/news-event/EditDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useModerateComment } from '@/hooks/useModerateComment';
import { usePostComment } from '@/hooks/usePostComment';
import { useStoredUserDisplayName } from '@/store/userAuthStore';
import type { NewsEventWithComment } from '@/types';
import { formatDate } from '@/utils/date';
import { Calendar, Check, Trash, X } from 'lucide-react';
import { toast } from 'sonner';

interface NewsEventCardProps {
  item: NewsEventWithComment;
  editable?: boolean;
}

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
        createdBy: name,
        comment,
        targetId: item.id,
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
    <div className="border-tanakayu-accent rounded border p-3">
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
