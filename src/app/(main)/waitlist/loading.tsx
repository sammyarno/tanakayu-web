import Breadcrumb from '@/components/Breadcrumb';
import ListSkeleton from '@/components/ListSkeleton';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Link2, UserCheck } from 'lucide-react';

const Loading = () => (
  <main className="flex w-full flex-col gap-6 py-4">
    <Breadcrumb
      items={[
        { label: 'Home', link: '/' },
        { label: 'Member Approvals', link: '/waitlist' },
      ]}
    />

    <PageHeader
      icon={UserCheck}
      title="Member Approvals"
      description="Review self-registrations and manage invitation links"
    />

    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="h-4 w-4" />
          Registrations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ListSkeleton leading="checkbox" actions={2} />
      </CardContent>
    </Card>

    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-4 w-4" />
          Invitation Links
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ListSkeleton leading="none" actions={2} rows={2} padded={false} />
      </CardContent>
    </Card>
  </main>
);

export default Loading;
