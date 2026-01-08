import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormController } from '@/components/ui/form-controller';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Shield } from 'lucide-react';

interface SecurityCardProps {
  isLoading: boolean;
  isEditing: boolean;
}

export const SecurityCard = ({ isLoading, isEditing }: SecurityCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" />
          Security
        </CardTitle>
        <CardDescription>Change your password to keep your account secure.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="password">New Password</Label>
          <FormController
            name="password"
            renderInput={field => (
              <div className="relative">
                <Input
                  {...field}
                  type="password"
                  placeholder="Min. 8 characters"
                  disabled={!isEditing || isLoading}
                  className="pl-9"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            )}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirm_password">Confirm Password</Label>
          <FormController
            name="confirm_password"
            renderInput={field => (
              <div className="relative">
                <Input
                  {...field}
                  type="password"
                  placeholder="Retype password"
                  disabled={!isEditing || isLoading}
                  className="pl-9"
                />
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
