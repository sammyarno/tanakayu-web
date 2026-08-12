import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Compass, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
      <Card className="border-tanakayu-accent/30 w-full max-w-md border-none shadow-lg sm:border">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="bg-tanakayu-sage/20 text-tanakayu-moss flex h-16 w-16 items-center justify-center rounded-full">
            <Compass className="h-8 w-8" />
          </div>
          <div>
            <p className="text-tanakayu-highlight font-serif text-6xl font-bold tracking-tight">404</p>
            <h1 className="text-tanakayu-dark mt-1 font-serif text-2xl font-bold tracking-tight">Page Not Found</h1>
          </div>
          <p className="text-tanakayu-dark/70 max-w-xs text-sm">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>
          <Button asChild className="mt-2 h-11 px-6 text-base font-semibold">
            <Link href="/">
              <Home className="mr-1 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
