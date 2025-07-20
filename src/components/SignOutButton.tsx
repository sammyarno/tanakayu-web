'use client';

import { Button } from '@/components/ui/button';
import { useSignOut } from '@/hooks/auth/useSignOut';
import { LogOut } from 'lucide-react';

interface SignOutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const SignOutButton = ({ 
  variant = 'outline', 
  size = 'default',
  className = ''
}: SignOutButtonProps) => {
  const { signOut, isLoading } = useSignOut();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={signOut}
      disabled={isLoading}
      className={className}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  );
};

export default SignOutButton;