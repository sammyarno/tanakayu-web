import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const Loading = () => (
  <main className="flex w-full flex-col gap-6 py-4">
    <div className="container mx-auto flex flex-col items-center justify-center px-4 pt-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-tanakayu-text text-2xl font-bold">Verify Member</h1>
          <p className="text-tanakayu-text">Scan the QR code on the member&apos;s card to verify their identity.</p>
        </div>

        <Card className="overflow-hidden border-2 p-0">
          <Skeleton className="bg-tanakayu-dark/10 aspect-square w-full rounded-none" />
        </Card>
      </div>
    </div>
  </main>
);

export default Loading;
