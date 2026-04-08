'use client';

import { Button } from '@/components/ui/button';
import { useSignOut } from '@/hooks/auth/useSignOut';
import clsx from 'clsx';
import { LogOut } from 'lucide-react';

interface SignOutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const SignOutButton = ({ variant = 'secondary', size = 'lg', className = '' }: SignOutButtonProps) => {
  const { signOut, isLoading } = useSignOut();
  const buttonClasses = clsx('w-full text-tanakayu-text tracking-wider font-bold', className);

  return (
    <Button variant={variant} size={size} onClick={signOut} disabled={isLoading} className={buttonClasses}>
      Sign Out
    </Button>
  );
};

export default SignOutButton;
