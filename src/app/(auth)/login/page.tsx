'use client';

import { FormEvent, useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
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
      console.log('useEffect error', error);
      setErrorMessage(error);
    }
  }, [error]);

  useEffect(() => {
    if (isInitialized && !isLoading && user && !error) {
      if (isAdmin()) {
        router.push('/admin');
      } else if (isMember()) {
        router.push('/');
      } else {
        // Fallback for unknown roles or just authenticated
        router.push('/');
      }
    }
  }, [user, error, router, isAdmin, isMember, isInitialized, isLoading]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow sm:border">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-sm">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {errorMessage && (
              <Alert variant="destructive" className="border-red-600 bg-red-50 text-red-900">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle className="tracking-wide capitalize">{errorMessage}</AlertTitle>
              </Alert>
            )}
            <form onSubmit={handleSignIn} onError={handleFormError}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput
                    id="password"
                    name="password"
                    required
                    disabled={isLoading}
                    placeholder="******"
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="mt-2 h-11 w-full text-base font-semibold" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background text-muted-foreground px-2">Or continue with</span>
              </div>
            </div>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <Link href="/register" className="hover:text-primary font-medium underline underline-offset-4">
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
