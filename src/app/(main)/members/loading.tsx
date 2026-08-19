import Breadcrumb from '@/components/Breadcrumb';
import ListSkeleton from '@/components/ListSkeleton';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';

const Loading = () => (
  <main className="flex w-full flex-col gap-6 py-4">
    <Breadcrumb
      items={[
        { label: 'Home', link: '/' },
        { label: 'Members', link: '/members' },
      ]}
    />

    <PageHeader icon={Users} title="Members" description="Loading..." />

    <div className="relative">
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input placeholder="Search by name, username, phone, or address..." className="pl-9" disabled />
    </div>

    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-base">All Members</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ListSkeleton />
      </CardContent>
    </Card>
  </main>
);

export default Loading;
