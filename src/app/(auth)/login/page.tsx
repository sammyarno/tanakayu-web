'use client';

import { FormEvent, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthError, useAuthLoading, useUser, useUserAuthStore } from '@/store/userAuthStore';
import { AlertCircleIcon } from 'lucide-react';

const Login = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>();
  const { signIn, clearError } = useUserAuthStore();
  const isLoading = useAuthLoading();
  const error = useAuthError();
  const user = useUser();

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(undefined);
    clearError();

    const formData = new FormData(e.currentTarget);

    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      return;
    }

    await signIn(email, password);
    router.push('/admin/dashboard');
  };

  const handleFormError = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage('Invalid credentials');
  };

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  useEffect(() => {
    if (user) {
      router.push('/admin/dashboard');
    }
  }, [user, router]);

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col items-stretch justify-center gap-6">
      <Card>
        <CardHeader className="text-center">
          <section
            id="bannner"
            className="bg-tanakayu-dark text-tanakayu-accent mb-4 rounded bg-[url('/leaf.jpg')] bg-cover bg-center p-5 text-center"
          >
            <p className="text-tanakayu-highlight font-serif text-5xl font-bold tracking-widest">TANAKAYU</p>
            <p className="font-sub-serif text-lg tracking-wider">From The Origin</p>
          </section>
          <CardTitle className="font-serif text-xl tracking-wider">Welcome Back!</CardTitle>
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="asdxx@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required disabled={isLoading} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Login
                </Button>
              </div>
            </form>
            <div className="text-center text-sm">
              <p>Don&apos;t have an account?</p>
              <p className="underline">Ask other admin to be invited!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
