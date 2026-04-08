'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { FormSchemaProvider } from '@/components/FormSchemaProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormController } from '@/components/ui/form-controller';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CLUSTER_LABELS, CLUSTER_LIST } from '@/data/clusters';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { updateProfileSchema } from '@/lib/validations/profile';
import type { User as UserType } from '@/types/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MapPin, Pencil, Phone, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

interface PersonalInfoSectionProps {
  profile: UserType;
}

const parseAddress = (address: string) => {
  const [cluster, ...addressParts] = address.split(',');
  return {
    cluster: cluster?.trim() as (typeof CLUSTER_LIST)[number],
    address: addressParts.join(',').trim(),
  };
};

export const PersonalInfoSection = ({ profile }: PersonalInfoSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: updateProfile, isPending } = useUpdateProfile(profile.id);
  const parsed = parseAddress(profile.address);

  const methods = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      display_name: profile.displayName,
      cluster: parsed.cluster,
      address: parsed.address,
      email: profile.email,
      phone: profile.phone,
    },
  });

  const { handleSubmit, reset } = methods;

  const handleCancel = () => {
    setIsEditing(false);
    reset({
      display_name: profile.displayName,
      cluster: parsed.cluster,
      address: parsed.address,
      email: profile.email,
      phone: profile.phone,
    });
  };

  const onSubmit = (data: UpdateProfileFormData) => {
    updateProfile(
      {
        id: profile.id,
        username: profile.username,
        address: `${data.cluster.trim()}, ${data.address.trim()}`,
        display_name: data.display_name,
        email: data.email,
        phone: data.phone,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success('Profile updated successfully!', { duration: 3000, position: 'top-center' });
        },
        onError: err => {
          toast.error(err.message, { duration: 3000, position: 'top-center' });
        },
      }
    );
  };

  if (!isEditing) {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <CardDescription>Your personal and residence details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow icon={<UserIcon className="h-4 w-4" />} label="Username" value={`@${profile.username}`} />
            <InfoRow icon={<UserIcon className="h-4 w-4" />} label="Display Name" value={profile.displayName} />
            <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
            <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={profile.phone} />
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="Cluster"
              value={CLUSTER_LABELS[parsed.cluster] || parsed.cluster}
            />
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="Address" value={parsed.address} />
          </div>
          <Button variant="secondary" className="w-full" onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <CardTitle className="text-lg">Edit Personal Information</CardTitle>
        <CardDescription>Update your personal and residence details.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormSchemaProvider methods={methods} schema={updateProfileSchema}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Label>Display Name</Label>
                <FormController
                  name="display_name"
                  renderInput={field => (
                    <div className="relative">
                      <Input {...field} placeholder="Enter your display name" disabled={isPending} className="pl-9" />
                      <UserIcon className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    </div>
                  )}
                />
              </div>

              <div className="grid gap-2">
                <Label>Email</Label>
                <FormController
                  name="email"
                  renderInput={field => (
                    <div className="relative">
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email"
                        disabled={isPending}
                        className="pl-9"
                      />
                      <Mail className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    </div>
                  )}
                />
              </div>

              <div className="grid gap-2">
                <Label>Phone Number</Label>
                <FormController
                  name="phone"
                  renderInput={field => (
                    <div className="relative">
                      <Input {...field} placeholder="08xxxxxxxxxx" disabled={isPending} className="pl-9" />
                      <Phone className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                    </div>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Cluster</Label>
                <FormController
                  name="cluster"
                  renderInput={field => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select cluster" />
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

              <div className="grid gap-2">
                <Label>Address</Label>
                <FormController
                  name="address"
                  renderInput={field => <Input {...field} placeholder="Block/Number" disabled={isPending} />}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </FormSchemaProvider>
      </CardContent>
    </Card>
  );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1">{icon}</div>
    <div className="min-w-0">
      <p className="text-tanakayu-bg text-sm">{label}</p>
      <p className="truncate text-base font-medium">{value || '-'}</p>
    </div>
  </div>
);
