import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormController } from '@/components/ui/form-controller';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Phone, User } from 'lucide-react';

interface PersonalInfoCardProps {
  isLoading: boolean;
  isEditing: boolean;
}

export const PersonalInfoCard = ({ isLoading, isEditing }: PersonalInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5 text-primary" />
          Personal Information
        </CardTitle>
        <CardDescription>Update your personal details.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2 md:col-span-2">
          <Label htmlFor="fullName">Full Name</Label>
          <FormController
            name="fullName"
            renderInput={field => (
              <div className="relative">
                <Input
                  {...field}
                  placeholder="Enter your full name"
                  disabled={!isEditing || isLoading}
                  className="pl-9"
                />
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            )}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <FormController
            name="email"
            renderInput={field => (
              <div className="relative">
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter your email"
                  disabled={!isEditing || isLoading}
                  className="pl-9"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            )}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <FormController
            name="phoneNumber"
            renderInput={field => (
              <div className="relative">
                <Input
                  {...field}
                  placeholder="08xxxxxxxxxx"
                  disabled={!isEditing || isLoading}
                  className="pl-9"
                />
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
