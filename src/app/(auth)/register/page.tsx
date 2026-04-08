'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
import { AlertCircleIcon, ArrowLeft, ArrowRight, CheckCircle2, Home, Loader2, Mail, Phone, User } from 'lucide-react';
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

const Register = () => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [phoneCheckError, setPhoneCheckError] = useState<string | null>(null);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const { mutate, isPending, isSuccess, error, isError } = useRegister();

  const methods = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: defaultFormValues,
    mode: 'onTouched',
  });
  const { handleSubmit, reset, trigger, formState } = methods;

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

  const checkPhonePermission = async (phone: string): Promise<boolean> => {
    try {
      setIsCheckingPhone(true);
      setPhoneCheckError(null);
      const res = await fetch(`/api/permitted-phones/check?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (!data.permitted) {
        setPhoneCheckError('This phone number is not registered');
        return false;
      }
      return true;
    } catch {
      setPhoneCheckError('Failed to verify phone number. Please try again.');
      return false;
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const handleNext = async () => {
    const currentFields = STEPS[step].fields as unknown as (keyof RegisterFormData)[];
    const valid = await trigger(currentFields);
    if (!valid) return;

    // On step 2 (Contact), verify phone is permitted before advancing
    if (step === 1) {
      const permitted = await checkPhonePermission(methods.getValues('phone_number'));
      if (!permitted) return;
    }

    setStep(s => s + 1);
  };

  const handleBack = () => {
    setPhoneCheckError(null);
    setStep(s => s - 1);
  };

  useEffect(() => {
    reset(defaultFormValues);
  }, [reset]);

  useEffect(() => {
    if (isSuccess && !error) {
      toast.success('Registration successful! Please sign in.', {
        duration: 3000,
        position: 'top-center',
      });
      router.push('/login');
    }
  }, [isSuccess, router, error]);

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col items-stretch justify-center gap-4 py-4">
      <Card className="overflow-hidden border-none shadow-lg sm:border">
        <CardHeader className="space-y-3 p-0">
          <div className="px-6 pt-2 pb-0">
            <h1 className="text-tanakayu-dark text-center text-2xl font-bold tracking-tight">Create Account</h1>
            <p className="text-tanakayu-dark mt-1 text-center text-sm">Join the Tanakayu community</p>
          </div>
        </CardHeader>

        <CardContent className="px-6 pt-4 pb-6">
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
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </button>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`mx-1 h-0.5 flex-1 rounded transition-colors ${
                        i < step ? 'bg-green-300' : 'bg-gray-200'
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
                        disabled={isPending}
                        className="h-11"
                      />
                    )}
                  />
                  <p className="text-muted-foreground text-xs">
                    Must be registered by admin. Contact your neighborhood admin if not yet registered.
                  </p>
                </div>
                {phoneCheckError && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900">
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertTitle className="text-sm leading-snug">{phoneCheckError}</AlertTitle>
                    <AlertDescription className="text-muted-foreground text-xs">
                      Ask admin to register your phone number
                    </AlertDescription>
                  </Alert>
                )}
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
                <div className="mt-2 rounded-lg bg-gray-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-gray-500 uppercase">Review</p>
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
                  <Button type="button" variant="outline" onClick={handleBack} disabled={isPending} className="h-11">
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
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="h-11 flex-1 text-base font-semibold"
                    disabled={isCheckingPhone}
                  >
                    {isCheckingPhone ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </>
                    )}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
