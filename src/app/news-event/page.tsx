'use client';

import { useState } from 'react';

import Breadcrumb from '@/components/Breadcrumb';
import PageContent from '@/components/PageContent';
import { newsEvents } from '@/data/newsevent';
import type { NewsEvent, NewsEventComment } from '@/types';
import { Calendar } from 'lucide-react';

const NewsEvent = () => {
  const [commentsData, setCommentsData] = useState<Record<number, NewsEventComment[]>>(() => {
    const initial: Record<number, NewsEventComment[]> = {};
    newsEvents.forEach(item => {
      initial[item.id] = [...item.comments];
    });
    return initial;
  });

  const handleAddComment = (eventId: number, name: string, comment: string) => {
    if (!name || !comment) {
      return;
    }

    const newCommentId =
      commentsData[eventId]?.length > 0 ? Math.max(...commentsData[eventId].map(c => c.id ?? 0)) + 1 : 1;

    const newComment: NewsEventComment = {
      id: newCommentId,
      comment: comment,
      createdAt: new Date(),
      createdBy: name,
    };

    setCommentsData(prev => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), newComment],
    }));
  };

  return (
    <PageContent>
      <Breadcrumb
        items={[
          { label: 'Home', link: '/' },
          { label: 'Berita & Acara', link: '/news-event' },
        ]}
      />
      <section id="menu" className="flex flex-col gap-4">
        <h2 className="font-sans text-3xl font-bold uppercase">📰 Berita & Acara</h2>
      </section>
      <section className="flex flex-col gap-4">
        {newsEvents.map(item => (
          <div key={`item-${item.id}`} className="bg-qwhite border-tanakayu-accent rounded border p-3">
            <h2 className="flex items-center text-lg font-semibold">
              <Calendar className="text-tanaka-highlight mr-2 h-5 w-5" />[{item.type === 'news' ? 'Berita' : 'Acara'}]{' '}
              {item.title}
            </h2>
            <p className="mb-2 text-xs text-gray-600">{item.createdBy}</p>
            <p className="text-sm text-gray-700">{item.content}</p>
            <hr className="my-2" />
            <details>
              <summary className="text-tanaka-dark cursor-pointer text-sm font-medium">
                💬 Lihat & Tambah Komentar
              </summary>

              <div className="flex flex-col gap-4 py-2">
                {commentsData[item.id].length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {(commentsData[item.id] || []).map((c, index) => (
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
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const name = form.name.trim();
                      const comment = form.comment.value.trim();
                      if (name && comment) {
                        handleAddComment(item.id, name, comment);
                        form.reset();
                      }
                    }}
                    className="flex flex-col gap-2"
                  >
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Nama Anda"
                      className="rounded border p-2 text-sm"
                    />
                    <textarea
                      name="comment"
                      required
                      rows={2}
                      placeholder="Tulis komentar..."
                      className="rounded border p-2 text-sm"
                    ></textarea>
                    <button
                      type="submit"
                      className="bg-tanakayu-highlight text-tanakayu-bg w-full rounded py-1 font-bold"
                    >
                      Kirim
                    </button>
                  </form>
                </div>
              </div>
            </details>
          </div>
        ))}
      </section>
    </PageContent>
  );
};

export default NewsEvent;
