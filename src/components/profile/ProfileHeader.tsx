'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { User } from '@/types/auth';

interface ProfileHeaderProps {
  profile: User;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center text-center">
        <Avatar className="size-20">
          <AvatarFallback className="text-2xl font-bold">
            {profile.displayName ? getInitials(profile.displayName) : 'ME'}
          </AvatarFallback>
        </Avatar>
        <h3 className="mt-3 text-lg font-semibold">{profile.displayName}</h3>
        <p className="text-tanakayu-bg text-sm">@{profile.username}</p>
        <Badge variant="default" className="mt-2 font-bold tracking-wider">
          {profile.role}
        </Badge>
      </CardContent>
    </Card>
  );
};
