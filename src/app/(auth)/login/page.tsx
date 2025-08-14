'use client';

import { FormEvent, useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Banner from '@/components/Banner';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/auth/useAuth';
import { useRoleCheck } from '@/hooks/auth/useRoleCheck';
import { AlertCircleIcon } from 'lucide-react';

const Login = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>();
  const { signIn, clearError, error, isLoading, user, isInitialized } = useAuth();
  const { isAdmin, isMember } = useRoleCheck();

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(undefined);
    clearError();

    const formData = new FormData(e.currentTarget);

    const username = formData.get('username')?.toString();
    const password = formData.get('password')?.toString();

    if (!username || !password) {
      return;
    }

    await signIn(username, password);
  };

  const handleFormError = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage('Invalid credentials');
  };

  useEffect(() => {
    if (error) {
      setErrorMessage('Invalid credentials');
    }
  }, [error]);

  useEffect(() => {
    if (isInitialized && !isLoading && user && !error) {
      if (isAdmin()) {
        router.push('/admin');
      } else if (isMember()) {
        router.push('/member');
      }
    }
  }, [user, error, router, isAdmin, isMember, isInitialized, isLoading]);

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col items-stretch justify-center gap-6">
      <Card>
        <CardHeader className="text-center">
          <Banner />
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {errorMessage && (
              <Alert variant="destructive" className="border-red-600 bg-red-300/40">
                <AlertCircleIcon />
                <AlertTitle className="tracking-wider capitalize">{errorMessage}</AlertTitle>
              </Alert>
            )}
            <form onSubmit={handleSignIn} onError={handleFormError}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                    placeholder="******"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Login
                </Button>
              </div>
            </form>
            <div className="text-center text-sm">
              <p>Don&apos;t have an account?</p>
              <Link href="/register" className="underline">
                Register here
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
