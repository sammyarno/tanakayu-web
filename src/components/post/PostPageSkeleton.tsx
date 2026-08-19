import Breadcrumb from '@/components/Breadcrumb';
import PageHeader from '@/components/PageHeader';
import PostCardSkeleton from '@/components/post/CardSkeleton';
import { Badge } from '@/components/ui/badge';
import { Megaphone } from 'lucide-react';

/**
 * The /post shell exactly as the page itself renders it while posts load.
 * Breadcrumb, header and filters are static, so they paint for real straight
 * away and never swap out - only the cards below transition to content.
 */
const PostPageSkeleton = () => (
  <main className="flex w-full flex-col gap-6 py-4">
    <Breadcrumb
      items={[
        { label: 'Home', link: '/' },
        { label: 'Announcements & Events', link: '/post' },
      ]}
    />

    <PageHeader icon={Megaphone} title="Announcements & Events" description="Loading..." />

    <section className="flex items-center gap-2">
      {['All', 'Announcement', 'Event'].map((label, i) => (
        <Badge key={label} variant={i === 0 ? 'default' : 'outline'} className="text-sm tracking-wide">
          {label}
        </Badge>
      ))}
    </section>

    <section className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </section>
  </main>
);

export default PostPageSkeleton;
