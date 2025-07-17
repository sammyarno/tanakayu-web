import { FC, FormEvent, memo } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { NewsEventWithComment } from '@/types';
import { Calendar } from 'lucide-react';

interface NewsEventCardProps {
  item: NewsEventWithComment;
  onAddComment: (item: NewsEventWithComment, name: string, comment: string) => void;
  isLoading?: boolean;
}

const NewsEventCard: FC<NewsEventCardProps> = memo(({ item, onAddComment, isLoading = false }) => {
  const comments = item.comments;

  const handleCommentSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const nameInput = form.elements.namedItem('name') as HTMLInputElement;
    const commentInput = form.elements.namedItem('comment') as HTMLTextAreaElement;
    const name = nameInput.value.trim();
    const comment = commentInput.value.trim();

    if (name && comment) {
      onAddComment(item, name, comment);
      form.reset();
    }
  };

  return (
    <div className="bg-qwhite border-tanakayu-accent rounded border p-3">
      <h2 className="flex items-center text-lg font-semibold">
        <Calendar className="text-tanaka-highlight mr-2 h-5 w-5" />[{item.type === 'news' ? 'Berita' : 'Acara'}]{' '}
        {item.title}
      </h2>
      <p className="mb-2 text-xs text-gray-600">{item.createdBy}</p>
      <p className="text-sm text-gray-700">{item.content}</p>
      <hr className="my-2" />
      <details>
        <summary className="text-tanaka-dark cursor-pointer text-sm font-medium">💬 Lihat & Tambah Komentar</summary>

        <div className="flex flex-col gap-4 py-2">
          {comments.length > 0 ? (
            <div className="flex flex-col gap-1">
              {comments.map((c, index) => (
                <div key={index} className="rounded bg-gray-100 p-2 text-sm">
                  <span className="text-tanaka-dark">{c.createdBy}</span>: {c.comment}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-800 italic">Belum ada komentar</p>
          )}

          <div className="border-tanakayu-dark/35 border-t py-2">
            <h3 className="mb-2 text-sm font-semibold text-gray-800">Tulis Komentar</h3>
            <form onSubmit={handleCommentSubmit} className="flex flex-col gap-2">
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
        </div>
      </details>
    </div>
  );
});

export default NewsEventCard;
