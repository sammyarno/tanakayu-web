'use client';

import { useForm } from 'react-hook-form';

import { FormSchemaProvider } from '@/components/FormSchemaProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormController } from '@/components/ui/form-controller';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { changePasswordSchema } from '@/lib/validations/profile';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordSectionProps {
  userId: string;
}

export const ChangePasswordSection = ({ userId }: ChangePasswordSectionProps) => {
  const { mutate: updateProfile, isPending } = useUpdateProfile(userId);

  const methods = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = (data: ChangePasswordFormData) => {
    updateProfile(
      {
        id: userId,
        password: data.password,
      },
      {
        onSuccess: () => {
          reset();
          toast.success('Password changed successfully!', { duration: 3000, position: 'top-center' });
        },
        onError: err => {
          toast.error(err.message, { duration: 3000, position: 'top-center' });
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <CardTitle className="text-lg">Change Password</CardTitle>
        <CardDescription>Update your password to keep your account secure.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormSchemaProvider methods={methods} schema={changePasswordSchema}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>New Password</Label>
                <FormController
                  name="password"
                  renderInput={field => (
                    <div className="relative">
                      <PasswordInput {...field} placeholder="Min. 8 characters" disabled={isPending} className="pl-9" />
                      <Lock className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 z-10 h-4 w-4" />
                    </div>
                  )}
                />
              </div>

              <div className="grid gap-2">
                <Label>Confirm Password</Label>
                <FormController
                  name="confirmPassword"
                  renderInput={field => (
                    <div className="relative">
                      <PasswordInput {...field} placeholder="Retype password" disabled={isPending} className="pl-9" />
                      <Lock className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 z-10 h-4 w-4" />
                    </div>
                  )}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPending} variant="secondary">
              Change Password
            </Button>
          </form>
        </FormSchemaProvider>
      </CardContent>
    </Card>
  );
};
