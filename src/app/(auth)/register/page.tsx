'use client';

import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import Banner from '@/components/Banner';
import { FormSchemaProvider } from '@/components/FormSchemaProvider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FormController } from '@/components/ui/form-controller';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CLUSTER_LABELS, CLUSTER_LIST } from '@/data/clusters';
import { useRegister } from '@/hooks/auth/useRegister';
import { registerSchema } from '@/lib/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircleIcon,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Home,
  Loader2,
  Mail,
  Phone,
  Sparkles,
  User,
} from 'lucide-react';
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

const STEPS = [
  {
    id: 'personal',
    label: 'Personal',
    icon: User,
    fields: ['full_name', 'username'] as const,
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: Mail,
    fields: ['email', 'phone_number'] as const,
  },
  {
    id: 'address',
    label: 'Address',
    icon: Home,
    fields: ['cluster', 'address'] as const,
  },
  {
    id: 'security',
    label: 'Security',
    icon: Phone,
    fields: ['password'] as const,
  },
] as const;

const RegisterForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite');

  const [step, setStep] = useState(0);
  const [invite, setInvite] = useState<{ fullName: string; phoneNumber: string | null } | null>(null);
  const { mutate, isPending, isSuccess, data, error, isError } = useRegister();

  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: defaultFormValues,
    mode: 'onTouched',
  });
  const { handleSubmit, reset, trigger, formState, setValue } = methods;

  useEffect(() => {
    if (!inviteToken) return;
    fetch(`/api/auth/invite/${encodeURIComponent(inviteToken)}`)
      .then(res => res.json())
      .then(data => {
        if (!data.valid) return;
        setInvite({ fullName: data.fullName, phoneNumber: data.phoneNumber });
        if (data.fullName) setValue('full_name', data.fullName);
        if (data.phoneNumber) setValue('phone_number', data.phoneNumber);
      })
      .catch(() => {});
  }, [inviteToken, setValue]);

  const onSubmit = (data: RegisterFormData) => {
    mutate({
      username: data.username,
      full_name: data.full_name,
      cluster: data.cluster,
      address: data.address,
      password: data.password,
      email: data.email,
      phone_number: data.phone_number,
      invite_token: inviteToken || undefined,
    });
  };

  const handleNext = async () => {
    const currentFields = STEPS[step].fields as unknown as (keyof RegisterFormData)[];
    const valid = await trigger(currentFields);
    if (!valid) return;
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setStep(s => s - 1);
  };

  useEffect(() => {
    reset(defaultFormValues);
  }, [reset]);

  useEffect(() => {
    if (isSuccess && !error && data?.approved) {
      toast.success('Registration successful! Please sign in.', {
        duration: 3000,
        position: 'top-center',
      });
      router.push('/login');
    }
  }, [isSuccess, router, error, data]);

  const isLastStep = step === STEPS.length - 1;
  const isWaitlisted = isSuccess && !error && data && !data.approved;

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col items-stretch justify-center gap-4 py-4">
      <Card className="overflow-hidden border-none shadow-lg sm:border">
        <CardHeader className="space-y-3 p-0">
          <div className="px-6 pt-2 pb-0">
            <h1 className="text-tanakayu-dark text-center font-serif text-2xl font-bold tracking-tight">
              Create Account
            </h1>
            <p className="text-tanakayu-dark/70 mt-1 text-center text-sm">Join the Tanakayu community</p>
          </div>
        </CardHeader>

        <CardContent className="px-6 pt-4 pb-6">
          {isWaitlisted ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="bg-tanakayu-sage/20 text-tanakayu-moss flex h-14 w-14 items-center justify-center rounded-full">
                <Clock className="h-7 w-7" />
              </div>
              <h2 className="font-serif text-xl font-bold">Registration submitted</h2>
              <p className="text-muted-foreground text-sm">
                An admin will review your registration shortly. You&apos;ll be able to sign in once it&apos;s approved.
              </p>
              <Link href="/login" className="mt-2 text-sm font-medium underline underline-offset-4">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              {invite && (
                <Alert className="border-tanakayu-sage/40 bg-tanakayu-sage/10 mb-4">
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle className="text-sm leading-snug">You&apos;ve been invited to join</AlertTitle>
                  <AlertDescription className="text-muted-foreground text-xs">
                    Your registration will be approved automatically.
                  </AlertDescription>
                </Alert>
              )}

              {/* Step Indicator */}
              <div className="mb-6 flex items-center justify-between">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const isActive = i === step;
                  const isCompleted = i < step;
                  return (
                    <div key={s.id} className="flex flex-1 items-center">
                      <button
                        type="button"
                        onClick={() => i < step && setStep(i)}
                        disabled={i > step}
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
                          isActive
                            ? 'bg-tanakayu-dark text-white shadow-md'
                            : isCompleted
                              ? 'bg-tanakayu-sage/25 text-tanakayu-moss hover:bg-tanakayu-sage/40'
                              : 'bg-tanakayu-dark/10 text-tanakayu-dark/40'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </button>
                      {i < STEPS.length - 1 && (
                        <div
                          className={`mx-1 h-0.5 flex-1 rounded transition-colors ${
                            i < step ? 'bg-tanakayu-sage/60' : 'bg-tanakayu-dark/15'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="mb-4 text-sm font-semibold tracking-wide">
                Step {step + 1}: {STEPS[step].label}
              </p>

              {/* Error Alert */}
              {isError && (
                <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50 text-red-900">
                  <AlertCircleIcon className="h-4 w-4" />
                  <AlertTitle>{(error as Error)?.message}</AlertTitle>
                </Alert>
              )}

              <FormSchemaProvider methods={methods} schema={registerSchema}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Step 1: Personal Info */}
                  <div className={step === 0 ? 'grid gap-4' : 'hidden'}>
                    <div className="grid gap-1.5">
                      <Label htmlFor="full_name">Full Name</Label>
                      <FormController
                        name="full_name"
                        renderInput={field => (
                          <Input
                            {...field}
                            id="full_name"
                            type="text"
                            placeholder="Your full name"
                            disabled={isPending}
                            className="h-11"
                            autoFocus
                          />
                        )}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="username">Username</Label>
                      <FormController
                        name="username"
                        renderInput={field => (
                          <Input
                            {...field}
                            id="username"
                            type="text"
                            placeholder="Choose a username (min 6 characters)"
                            disabled={isPending}
                            className="h-11"
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Step 2: Contact Info */}
                  <div className={step === 1 ? 'grid gap-4' : 'hidden'}>
                    <div className="grid gap-1.5">
                      <Label htmlFor="email">Email</Label>
                      <FormController
                        name="email"
                        renderInput={field => (
                          <Input
                            {...field}
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            disabled={isPending}
                            className="h-11"
                            autoFocus
                          />
                        )}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <FormController
                        name="phone_number"
                        renderInput={field => (
                          <Input
                            {...field}
                            id="phone_number"
                            type="tel"
                            placeholder="e.g. 087788000000"
                            disabled={isPending || !!invite?.phoneNumber}
                            className="h-11"
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Step 3: Address */}
                  <div className={step === 2 ? 'grid gap-4' : 'hidden'}>
                    <div className="grid gap-1.5">
                      <Label htmlFor="cluster">Cluster / Block</Label>
                      <FormController
                        name="cluster"
                        renderInput={field => (
                          <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select your cluster" />
                            </SelectTrigger>
                            <SelectContent>
                              {CLUSTER_LIST.map(cluster => (
                                <SelectItem key={cluster} value={cluster}>
                                  {CLUSTER_LABELS[cluster]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="address">House Number</Label>
                      <FormController
                        name="address"
                        renderInput={field => (
                          <Input
                            {...field}
                            id="address"
                            type="text"
                            placeholder="e.g. G9/5"
                            disabled={isPending}
                            className="h-11"
                            autoFocus
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Step 4: Security */}
                  <div className={step === 3 ? 'grid gap-4' : 'hidden'}>
                    <div className="grid gap-1.5">
                      <Label htmlFor="password">Password</Label>
                      <FormController
                        name="password"
                        renderInput={field => (
                          <PasswordInput
                            {...field}
                            id="password"
                            placeholder="Min 8 characters, 1 uppercase, 1 number"
                            disabled={isPending}
                            className="h-11"
                            autoFocus
                          />
                        )}
                      />
                    </div>

                    {/* Summary */}
                    <div className="bg-tanakayu-dark/5 mt-2 rounded-lg p-3">
                      <p className="text-tanakayu-dark/60 mb-2 text-xs font-semibold uppercase">Review</p>
                      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                        <dt className="text-muted-foreground">Name</dt>
                        <dd className="truncate font-medium">{methods.getValues('full_name') || '-'}</dd>
                        <dt className="text-muted-foreground">Username</dt>
                        <dd className="truncate font-medium">{methods.getValues('username') || '-'}</dd>
                        <dt className="text-muted-foreground">Email</dt>
                        <dd className="truncate font-medium">{methods.getValues('email') || '-'}</dd>
                        <dt className="text-muted-foreground">Phone</dt>
                        <dd className="truncate font-medium">{methods.getValues('phone_number') || '-'}</dd>
                        <dt className="text-muted-foreground">Address</dt>
                        <dd className="truncate font-medium">
                          {CLUSTER_LABELS[methods.getValues('cluster')] || ''}, {methods.getValues('address') || '-'}
                        </dd>
                      </dl>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="mt-6 flex gap-3">
                    {step > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        disabled={isPending}
                        className="h-11"
                      >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back
                      </Button>
                    )}
                    {isLastStep ? (
                      <Button
                        type="submit"
                        className="h-11 flex-1 text-base font-semibold"
                        disabled={isPending || !formState.isValid}
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    ) : (
                      <Button type="button" onClick={handleNext} className="h-11 flex-1 text-base font-semibold">
                        Continue
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </form>
              </FormSchemaProvider>

              <div className="mt-6 text-center text-sm">
                <span className="text-tanakayu-dark">Already have an account? </span>
                <Link href="/login" className="hover:text-primary font-medium underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Register = () => (
  <Suspense fallback={null}>
    <RegisterForm />
  </Suspense>
);

export default Register;
