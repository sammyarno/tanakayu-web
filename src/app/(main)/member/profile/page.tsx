'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import Breadcrumb from '@/components/Breadcrumb';
import { FormSchemaProvider } from '@/components/FormSchemaProvider';
import PageContent from '@/components/PageContent';
import { IdentityCard } from '@/components/profile/IdentityCard';
import { PersonalInfoCard } from '@/components/profile/PersonalInfoCard';
import { ResidenceCard } from '@/components/profile/ResidenceCard';
import { SecurityCard } from '@/components/profile/SecurityCard';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchProfile } from '@/hooks/useFetchProfile';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { editProfileSchema } from '@/lib/validations/profile';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

type ProfileFormData = z.infer<typeof editProfileSchema>;

const defaultFormValues: ProfileFormData = {
  address: '',
  cluster: 'others',
  confirmPassword: '',
  email: '',
  display_name: '',
  password: '',
  phone: '',
  username: '',
};

const ProfilePage = () => {
  const { userId, username, role } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isEditing, setIsEditing] = useState(false);
  const { data: profileRes, isFetching } = useFetchProfile({ id: userId || '', username: username || '' });
  const { mutate: updateProfile, isPending, isSuccess, isError, error } = useUpdateProfile(userId || '');
  const isLoading = isFetching || isPending;

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: defaultFormValues,
  });
  const { handleSubmit, reset, setValue } = methods;

  const onSubmit = (data: ProfileFormData) => {
    updateProfile({
      id: userId || '',
      username: username || '',
      address: `${data.cluster.trim()}, ${data.address.trim()}`,
      display_name: data.display_name,
      email: data.email,
      password: data.password || undefined,
      phone: data.phone,
    });

    setValue('password', '');
    setValue('confirmPassword', '');
  };

  useEffect(() => {
    if (profileRes) {
      const [cluster, ...addressParts] = profileRes.address.split(',');
      const address = addressParts.join(',').trim();

      reset({
        ...profileRes,
        display_name: profileRes.displayName,
        cluster: cluster as any,
        address: address,
        password: '',
        confirmPassword: '',
      });
    }
  }, [reset, profileRes]);

  useEffect(() => {
    if (isSuccess && !error) {
      setErrorMessage(undefined);
      setIsEditing(false);
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

  const handleCancel = () => {
    setIsEditing(false);
    if (profileRes) {
      const [cluster, ...addressParts] = profileRes.address.split(',');
      const address = addressParts.join(',').trim();

      reset({
        ...profileRes,
        cluster: cluster as any,
        address: address,
        password: '',
        confirmPassword: '',
      });
    } else {
      reset(defaultFormValues);
    }
  };

  return (
    <PageContent allowedRoles={['PENGHUNI', 'PENGURUS', 'ADMIN']} fallbackPath="/member">
      <div className="space-y-2">
        <Breadcrumb
          items={[
            { label: 'Home', link: '/member' },
            { label: 'Profile', link: '/member/profile' },
          ]}
        />
        <h2 className="font-sans text-3xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="mb-6 border-red-600 bg-red-50 text-red-900">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle className="tracking-wide capitalize">{errorMessage}</AlertTitle>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <IdentityCard display_name={profileRes?.displayName} username={username} role={profileRes?.role || role} />

        <FormSchemaProvider methods={methods} schema={editProfileSchema}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <PersonalInfoCard isLoading={isLoading} isEditing={isEditing} />
            <ResidenceCard isLoading={isLoading} isEditing={isEditing} />
            <SecurityCard isLoading={isLoading} isEditing={isEditing} />

            <div className="flex justify-end gap-4 pt-4">
              {!isEditing ? (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                  size="lg"
                >
                  Update Profile
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </form>
        </FormSchemaProvider>
      </div>
    </PageContent>
  );
};

export default ProfilePage;
