'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import Breadcrumb from '@/components/Breadcrumb';
import { FormSchemaProvider } from '@/components/FormSchemaProvider';
import PageContent from '@/components/PageContent';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormController } from '@/components/ui/form-controller';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CLUSTER_LIST } from '@/data/clusters';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchProfile } from '@/hooks/useFetchProfile';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const profileSchema = z
  .object({
    username: z.string().min(1, 'Username is required').min(6, 'Username must be at least 6 characters'),
    full_name: z.string().min(1, 'Full Name is required').min(6, 'Full Name must be at least 6 characters'),
    cluster: z.enum(CLUSTER_LIST, { message: 'Cluster must be selected' }),
    address: z.string().min(1, 'Address is required'),
    password: z
      .string()
      .optional()
      .refine(val => !val || val.length >= 8, { message: 'Password must be at least 8 characters' }),
    email: z.string().email('Please enter a valid email'),
    phone_number: z
      .string()
      .min(1, 'Phone Number is required')
      .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, 'Invalid Indonesian phone number'),
    confirm_password: z.string().optional(),
  })
  .refine(
    data => {
      if (data.password && data.password !== data.confirm_password) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ['confirm_password'],
    }
  );

type ProfileFormData = z.infer<typeof profileSchema>;

const defaultFormValues: ProfileFormData = {
  address: '',
  cluster: 'others',
  confirm_password: '',
  email: '',
  full_name: '',
  password: '',
  phone_number: '',
  username: '',
};

const ProfilePage = () => {
  const { userId, username } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>();
  const { data: profileRes, isFetching } = useFetchProfile({ id: userId || '', username: username || '' });
  const { mutate: updateProfile, isPending, isSuccess, isError, error } = useUpdateProfile(userId || '');

  const isLoading = isFetching || isPending;

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultFormValues,
  });
  const { handleSubmit, reset, setValue } = methods;

  const onSubmit = (data: ProfileFormData) => {
    updateProfile({
      id: userId || '',
      username: username || '',
      address: `${data.cluster.trim()}, ${data.address.trim()}`,
      full_name: data.full_name,
      email: data.email,
      password: data.password || undefined,
      phone_number: data.phone_number,
    });

    setValue('password', '');
    setValue('confirm_password', '');
  };

  useEffect(() => {
    if (profileRes) {
      reset({
        ...profileRes,
        cluster: profileRes.address.split(',')[0] as any,
        address: profileRes.address.split(',')[1],
        password: '',
        confirm_password: '',
      });
    }
  }, [reset, profileRes]);

  useEffect(() => {
    if (isSuccess && !error) {
      setErrorMessage(undefined);
      toast.success('Profile updated successfully!', {
        duration: 3000,
        position: 'top-center',
      });
    }
  }, [isSuccess, error]);

  useEffect(() => {
    if (isError) {
      setErrorMessage(error.message);
    }
  }, [isError, error]);

  return (
    <PageContent mustAuthenticate>
      <Breadcrumb
        items={[
          { label: 'Home', link: '/admin/dashboard' },
          { label: 'Edit Profile', link: '/admin/profile' },
        ]}
      />
      <section id="menu" className="flex flex-col gap-4">
        <h2 className="font-sans text-3xl font-bold uppercase">👥 Edit Profile</h2>
      </section>
      <section className="flex flex-col gap-4">
        {errorMessage && (
          <Alert variant="destructive" className="border-red-600 bg-red-300/40">
            <AlertCircleIcon />
            <AlertTitle className="tracking-wider capitalize">{errorMessage}</AlertTitle>
          </Alert>
        )}
        <FormSchemaProvider methods={methods} schema={profileSchema}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-1">
                <Label htmlFor="username">Username</Label>
                <FormController
                  name="username"
                  renderInput={field => <Input {...field} placeholder="Username" disabled className="bg-gray-300" />}
                />
                <p className="text-xs text-red-500">Can't be changed</p>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="full_name">Full Name</Label>
                <FormController
                  name="full_name"
                  renderInput={field => <Input {...field} placeholder="Enter your full name" disabled={isLoading} />}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="email">Email</Label>
                <FormController
                  name="email"
                  renderInput={field => (
                    <Input {...field} type="email" placeholder="Enter your email" disabled={isLoading} />
                  )}
                />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="phone_number">Phone Number</Label>
                <FormController
                  name="phone_number"
                  renderInput={field => <Input {...field} placeholder="08xxxxxxxxxx" disabled={isLoading} />}
                />
              </div>

              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-2 grid gap-1">
                  <Label htmlFor="cluster">Cluster</Label>
                  <FormController
                    name="cluster"
                    renderInput={field => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <SelectTrigger className="capitalize">
                          <SelectValue placeholder="Select cluster" />
                        </SelectTrigger>
                        <SelectContent>
                          {CLUSTER_LIST.map(cluster => (
                            <SelectItem key={cluster} value={cluster} className="capitalize">
                              {cluster}
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
                    renderInput={field => <Input {...field} placeholder="Enter your address" disabled={isLoading} />}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="mb-4 text-lg font-semibold">Change Password</h3>
              <p className="mb-4 text-sm text-gray-600">
                Leave password fields empty if you don't want to change your password.
              </p>

              <div className="grid gap-4">
                <div className="grid gap-1">
                  <Label htmlFor="password">New Password</Label>
                  <FormController
                    name="password"
                    renderInput={field => (
                      <Input {...field} type="password" placeholder="Enter new password" disabled={isLoading} />
                    )}
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <FormController
                    name="confirm_password"
                    renderInput={field => (
                      <Input {...field} type="password" placeholder="Confirm new password" disabled={isLoading} />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </form>
        </FormSchemaProvider>
      </section>
    </PageContent>
  );
};

export default ProfilePage;
