'use client';

import { Suspense, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

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
  Check,
  CheckCircle2,
  Clock,
  Home,
  Loader2,
  Lock,
  Mail,
  Pencil,
  Sparkles,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

// Local-only schema: adds a confirm-password field the server never sees.
// Kept separate from `registerSchema` (used by the API route) so the two stay in sync deliberately.
const registerFormObjectSchema = registerSchema.extend({
  confirm_password: z.string().min(1, 'Please confirm your password'),
});
const registerFormSchema = registerFormObjectSchema.refine(data => data.password === data.confirm_password, {
  path: ['confirm_password'],
  message: 'Passwords do not match',
});
type RegisterFormData = z.infer<typeof registerFormObjectSchema>;

const defaultFormValues: RegisterFormData = {
  username: '',
  full_name: '',
  cluster: 'others',
  address: '',
  password: '',
  confirm_password: '',
  email: '',
  phone_number: '',
};

const PASSWORD_RULES = [
  { test: (v: string) => v.length >= 8, label: 'At least 8 characters' },
  { test: (v: string) => /[A-Z]/.test(v), label: 'One uppercase letter' },
  { test: (v: string) => /[0-9]/.test(v), label: 'One number' },
] as const;

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
    icon: Lock,
    fields: ['password', 'confirm_password'] as const,
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
    resolver: zodResolver(registerFormSchema),
    defaultValues: defaultFormValues,
    mode: 'onTouched',
  });
  const { handleSubmit, reset, trigger, formState, setValue } = methods;
  // useWatch rather than methods.watch: the latter can't be memoized, so React
  // Compiler skips optimizing the whole component.
  const passwordValue = useWatch({ control: methods.control, name: 'password' }) || '';

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
              <div className="mb-6 flex items-start" role="tablist" aria-label="Registration steps">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const isActive = i === step;
                  const isCompleted = i < step;
                  return (
                    // "contents" keeps this key holder out of the flex layout, so the icon column
                    // and connector line below are direct, equally-sized flex siblings.
                    <div key={s.id} className="contents">
                      <div className="flex w-14 shrink-0 flex-col items-center gap-1">
                        <button
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-current={isActive ? 'step' : undefined}
                          aria-label={`${s.label} step${isCompleted ? ', completed' : isActive ? ', current' : ', upcoming'}`}
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
                        <span
                          className={`w-full truncate text-center text-[10px] font-medium ${isActive ? 'text-tanakayu-dark' : 'text-tanakayu-dark/40'}`}
                        >
                          {s.label}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div
                          className={`mt-5 h-0.5 flex-1 rounded transition-colors ${
                            i < step ? 'bg-tanakayu-sage/60' : 'bg-tanakayu-dark/15'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Error Alert */}
              {isError && (
                <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50 text-red-900">
                  <AlertCircleIcon className="h-4 w-4" />
                  <AlertTitle>{(error as Error)?.message}</AlertTitle>
                </Alert>
              )}

              <FormSchemaProvider methods={methods} schema={registerFormObjectSchema}>
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
                          <PasswordInput {...field} id="password" disabled={isPending} className="h-11" autoFocus />
                        )}
                      />
                      <ul className="mt-1 grid gap-1">
                        {PASSWORD_RULES.map(rule => {
                          const met = rule.test(passwordValue);
                          return (
                            <li
                              key={rule.label}
                              className={`flex items-center gap-1.5 text-xs ${met ? 'text-tanakayu-moss' : 'text-muted-foreground'}`}
                            >
                              {met ? (
                                <Check className="h-3 w-3 shrink-0" />
                              ) : (
                                <span className="h-1 w-1 shrink-0 rounded-full bg-current" />
                              )}
                              {rule.label}
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="confirm_password">Confirm Password</Label>
                      <FormController
                        name="confirm_password"
                        renderInput={field => (
                          <PasswordInput {...field} id="confirm_password" disabled={isPending} className="h-11" />
                        )}
                      />
                    </div>

                    {/* Summary */}
                    <div className="bg-tanakayu-dark/5 mt-2 grid gap-3 rounded-lg p-3">
                      <p className="text-tanakayu-dark/60 text-xs font-semibold uppercase">Review</p>
                      <ReviewGroup label="Personal" onEdit={() => setStep(0)}>
                        <ReviewRow label="Name" value={methods.getValues('full_name')} />
                        <ReviewRow label="Username" value={methods.getValues('username')} />
                      </ReviewGroup>
                      <ReviewGroup label="Contact" onEdit={() => setStep(1)}>
                        <ReviewRow label="Email" value={methods.getValues('email')} />
                        <ReviewRow label="Phone" value={methods.getValues('phone_number')} />
                      </ReviewGroup>
                      <ReviewGroup label="Address" onEdit={() => setStep(2)}>
                        <ReviewRow
                          label="Location"
                          value={`${CLUSTER_LABELS[methods.getValues('cluster')] || ''}, ${methods.getValues('address') || '-'}`}
                        />
                      </ReviewGroup>
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

interface ReviewGroupProps {
  label: string;
  onEdit: () => void;
  children: React.ReactNode;
}

function ReviewGroup({ label, onEdit, children }: ReviewGroupProps) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-tanakayu-dark/50 text-[10px] font-semibold uppercase">{label}</p>
        <button
          type="button"
          onClick={onEdit}
          className="text-tanakayu-moss flex items-center gap-1 text-xs font-medium hover:underline"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">{children}</dl>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value || '-'}</dd>
    </>
  );
}

const Register = () => (
  <Suspense fallback={null}>
    <RegisterForm />
  </Suspense>
);

export default Register;
