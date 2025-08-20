'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Banner from '@/components/Banner';
import { FormSchemaProvider } from '@/components/FormSchemaProvider';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormController } from '@/components/ui/form-controller';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CLUSTER_LABELS, CLUSTER_LIST } from '@/data/clusters';
import { useRegister } from '@/hooks/auth/useRegister';
import { registerSchema } from '@/lib/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

type RegisterFormData = z.infer<typeof registerSchema>;

const defaultFormValues: RegisterFormData = {
  username: '',
  full_name: '',
  cluster: 'others',
  address: '',
  password: '',
  email: '',
  phone_number: '',
};

const Register = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>();
  const { mutate, isPending, isSuccess, error, isError } = useRegister();

  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: defaultFormValues,
  });
  const { handleSubmit, reset } = methods;

  const onSubmit = (data: RegisterFormData) => {
    mutate({
      username: data.username,
      full_name: data.full_name,
      cluster: data.cluster,
      address: data.address,
      password: data.password,
      email: data.email,
      phone_number: data.phone_number,
    });
  };

  useEffect(() => {
    reset(defaultFormValues);
  }, [reset]);

  useEffect(() => {
    if (isSuccess && !error) {
      setErrorMessage(undefined);
      toast.success('Member registered successfully', {
        duration: 3000,
        position: 'top-center',
      });
      router.push('/login');
    }
  }, [isSuccess, router, error]);

  useEffect(() => {
    if (isError) {
      setErrorMessage((error as Error).message);
    }
  }, [isError, error]);

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col items-stretch justify-center gap-6">
      <Card>
        <CardHeader className="text-center">
          <Banner />
          <CardTitle className="font-serif text-xl tracking-wider">Register New Member</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {errorMessage && (
              <Alert variant="destructive" className="border-red-600 bg-red-300/40">
                <AlertCircleIcon />
                <AlertTitle className="tracking-wider capitalize">{errorMessage}</AlertTitle>
              </Alert>
            )}
            <FormSchemaProvider methods={methods} schema={registerSchema}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                  <div className="grid gap-1">
                    <Label htmlFor="username">Username</Label>
                    <FormController
                      name="username"
                      renderInput={field => (
                        <Input
                          {...field}
                          id="username"
                          type="text"
                          placeholder="Enter username (min 6 characters)"
                          disabled={isPending}
                        />
                      )}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="full_name">Full Name</Label>
                    <FormController
                      name="full_name"
                      renderInput={field => (
                        <Input
                          {...field}
                          id="full_name"
                          type="text"
                          placeholder="Enter full name"
                          disabled={isPending}
                        />
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="col-span-2 grid gap-1">
                      <Label htmlFor="cluster">Cluster</Label>
                      <FormController
                        name="cluster"
                        renderInput={field => (
                          <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                            <SelectTrigger className="capitalize">
                              <SelectValue placeholder="Select cluster" />
                            </SelectTrigger>
                            <SelectContent>
                              {CLUSTER_LIST.map(cluster => (
                                <SelectItem key={cluster} value={cluster} className="capitalize">
                                  {CLUSTER_LABELS[cluster]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="col-span-3 grid gap-1">
                      <Label htmlFor="address">Address</Label>
                      <FormController
                        name="address"
                        renderInput={field => (
                          <Input {...field} id="address" type="text" placeholder="e.g. G9/5" disabled={isPending} />
                        )}
                      />
                    </div>
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="email">Email</Label>
                    <FormController
                      name="email"
                      renderInput={field => (
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="Enter email address"
                          disabled={isPending}
                        />
                      )}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <FormController
                      name="phone_number"
                      renderInput={field => (
                        <Input
                          {...field}
                          id="phone_number"
                          type="text"
                          placeholder="e.g. 087788000000"
                          disabled={isPending}
                        />
                      )}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="password">Password</Label>
                    <FormController
                      name="password"
                      renderInput={field => (
                        <Input
                          {...field}
                          id="password"
                          type="password"
                          placeholder="Enter password (min 8 characters)"
                          disabled={isPending}
                        />
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    Register
                  </Button>
                </div>
              </form>
            </FormSchemaProvider>
            <div className="text-center text-sm">
              <p>Already have an account?</p>
              <Link href="/login" className="underline">
                Sign in here
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
