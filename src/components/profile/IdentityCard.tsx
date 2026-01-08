import SignOutButton from '@/components/SignOutButton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User as UserIcon } from 'lucide-react';

interface IdentityCardProps {
  fullName?: string | null;
  username?: string | null;
  role?: string | null;
}

export const IdentityCard = ({ fullName, username, role }: IdentityCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="bg-muted mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-2xl font-bold">{fullName ? getInitials(fullName) : 'ME'}</AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl">{fullName || username}</CardTitle>
        <CardDescription className="flex items-center justify-center gap-2 pt-2">
          <Badge variant="secondary" className="px-3 py-1">
            {role}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SignOutButton className="w-full" variant="outline" />
      </CardContent>
    </Card>
  );
};
