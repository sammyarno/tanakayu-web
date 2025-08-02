'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import Breadcrumb from '@/components/Breadcrumb';
import PageContent from '@/components/PageContent';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/auth/useAuth';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

const profileSchema = z
  .object({
    displayName: z.string().min(2, {
      message: 'Display name must be at least 2 characters.',
    }),
    email: z.string().email({
      message: 'Please enter a valid email address.',
    }),
    password: z
      .string()
      .min(6, {
        message: 'Password must be at least 6 characters.',
      })
      .optional()
      .or(z.literal('')),
    confirmPassword: z.string().optional(),
  })
  .refine(
    data => {
      if (data.password && data.password !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }
  );

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const { displayName, email } = useAuth();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Load user data when component mounts
  useEffect(() => {
    if (displayName) {
      form.reset({
        displayName: displayName || '',
        email: email,
        password: '',
        confirmPassword: '',
      });
    }
  }, [displayName, email, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile({
        displayName: data.displayName,
        email: data.email,
        password: data.password || undefined,
      });

      toast.success('Profile updated successfully!', {
        duration: 3000,
        position: 'top-center',
      });

      // Clear password fields after successful update
      form.setValue('password', '');
      form.setValue('confirmPassword', '');
      // Keep the updated display name and email values
      form.setValue('displayName', data.displayName);
      form.setValue('email', data.email);
    } catch (error) {
      toast.error('Failed to update profile. Please try again.', {
        duration: 3000,
        position: 'top-center',
      });
      console.error('Profile update error:', error);
    }
  };

  return (
    <PageContent isAdmin>
      <Breadcrumb
        items={[
          { label: 'Home', link: '/admin/dashboard' },
          { label: 'Edit Profile', link: '/admin/profile' },
        ]}
      />

      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">👥 Edit Profile</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your display name" {...field} />
                  </FormControl>
                  <FormDescription>This is your public display name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormDescription>Your email address for login and notifications.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-6">
              <h3 className="mb-4 text-lg font-semibold">Change Password</h3>
              <p className="mb-4 text-sm text-gray-600">
                Leave password fields empty if you don't want to change your password.
              </p>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter new password" {...field} />
                      </FormControl>
                      <FormDescription>Must be at least 6 characters long.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => window.history.back()} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageContent>
  );
};

export default ProfilePage;
