import { type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/auth/useAuth';
import { useModerateComment } from '@/hooks/useModerateComment';
import { usePostComment } from '@/hooks/usePostComment';
import { Comment } from '@/types';
import { Check, Trash, X } from 'lucide-react';
import { toast } from 'sonner';

interface PostCommentProps {
  comments: Comment[];
  postId: string;
  type: 'news_event' | 'announcement';
  editable: boolean;
}

const PostComment = (props: PostCommentProps) => {
  const { comments, postId, type, editable } = props;
  const { username } = useAuth();
  const { mutateAsync: postComment, isPending: isPostLoading } = usePostComment();
  const { mutateAsync: moderateComment, isPending: isModerateLoading } = useModerateComment();

  const isLoading = isPostLoading || isModerateLoading;

  const handleApproveComment = async (commentId: string) => {
    if (!username) return;
    try {
      await moderateComment({
        commentId,
        action: 'approve',
        actor: username,
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
    if (!username) return;
    try {
      await moderateComment({
        commentId,
        action: 'reject',
        actor: username,
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
    if (!username) return;
    try {
      await moderateComment({
        commentId,
        action: 'delete',
        actor: username,
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
        targetId: postId,
        targetType: type,
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

  const handleRenderComments = () => {
    if (comments.length === 0) {
      return <p className="text-xs text-gray-800 italic">Belum ada komentar</p>;
    }

    return (
      <div className="flex flex-col gap-1">
        {comments.map((c, index) => {
          const isUnmanaged = !c.approvedAt && !c.rejectedAt;

          return (
            <div key={index} className="flex items-center justify-between rounded bg-gray-100 px-2 py-1 text-sm">
              <p className="text-tanaka-dark">
                {c.createdBy}: {c.comment}
              </p>
              {editable && (
                <div className="flex items-center gap-1">
                  {isUnmanaged && (
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
          );
        })}
      </div>
    );
  };

  const handleRenderCommentForm = () => {
    if (!editable) return <></>;

    return (
      <div className="border-tanakayu-dark/35 border-t py-2">
        <h3 className="mb-2 text-sm font-semibold text-gray-800">Tulis Komentar</h3>
        <form onSubmit={handlePostComment} className="flex flex-col gap-2">
          <Input type="text" name="name" required placeholder="Nama Anda" className="rounded border p-2 text-sm" />
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
    );
  };

  return (
    <details>
      <summary className="text-tanaka-dark cursor-pointer text-sm font-medium">💬 Lihat & Tambah Komentar</summary>

      <div className="flex flex-col gap-4 py-2">
        {handleRenderComments()}
        {handleRenderCommentForm()}
      </div>
    </details>
  );
};

export default PostComment;
