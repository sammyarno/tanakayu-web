import SignOutButton from '@/components/SignOutButton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface IdentityCardProps {
  display_name?: string | null;
  username?: string | null;
  role?: string | null;
}

export const IdentityCard = ({ display_name, username, role }: IdentityCardProps) => {
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
        <div className="bg-muted mx-auto mb-2 flex size-24 items-center justify-center rounded-full">
          <Avatar className="size-24">
            <AvatarFallback className="text-2xl font-bold">
              {display_name ? getInitials(display_name) : 'ME'}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl">{display_name || username}</CardTitle>
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
